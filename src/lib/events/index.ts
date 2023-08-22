import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints';
import { isFullPage } from '../notion/utils';
import { richTextToPlain } from '../utils';
import { copyFileToS3 } from '../s3Client';
const { NOTION_KEY, NOTION_EVENTS_DATABASE = '' } = process.env;

// Initializing a client
const notion = new Client({
  auth: NOTION_KEY,
});

interface GetAllEventsOption {
  pageSize?: number;
  filter?: {
    isPro?: boolean;
  };
}

const parseEventPageMeta = async (
  page: PageObjectResponse,
): Promise<EventMeta> => {
  const {
    properties: { slug, Name, pro, date },
  } = page;

  // validation
  if (slug.type !== 'rich_text') {
    throw new Error('Validation Error: slug is not a rich_text');
  }
  if (Name.type !== 'title') {
    throw new Error('Validation Error: Name is not a title');
  }

  if (pro.type !== 'checkbox') {
    throw new Error('Validation Error: Pro is not a checkbox');
  }

  if (date.type !== 'date' || !date.date?.start) {
    throw new Error('Validation Error: Date is not a date');
  }

  const event: EventMeta = {
    id: page.id,
    updatedOn: page.last_edited_time,
    slug: richTextToPlain(slug.rich_text),
    title: richTextToPlain(Name.title),
    isPro: pro.checkbox,
    date: date.date.start,
  };

  if (page.cover?.type === 'file' && page.cover.file.url) {
    event.image = await copyFileToS3(page.cover.file.url);
  }
  return event;
};

export const getAllEvents = async ({
  pageSize = 100,
  filter,
}: GetAllEventsOption): Promise<EventMeta[]> => {
  // const filter: any = { and: [getStatusFilter()] };
  const notionFilter: any = { and: [] };
  if (filter?.isPro) {
    notionFilter.and.push({
      property: 'pro',
      checkbox: {
        equals: filter.isPro,
      },
    });
  }
  console.log(notionFilter);

  const query: QueryDatabaseParameters = {
    database_id: NOTION_EVENTS_DATABASE,
    page_size: pageSize,
    filter: notionFilter,
  };

  const response = await notion.databases.query(query);

  return Promise.all(
    response.results.filter(isFullPage).map((page) => parseEventPageMeta(page)),
  );
};
