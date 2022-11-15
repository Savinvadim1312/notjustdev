/* eslint-disable import/named */
import { Image, Parent, Root } from 'mdast';
import { MdxjsEsm, MdxJsxTextElement } from 'mdast-util-mdx';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { dirname, join } from 'path';
import sizeOf from 'image-size';

// This plugin was adjusted based on remark-mdx-image. I added the width and height of the images

export interface RemarkMdxImagesOptions {
  /**
   * By default imports are resolved relative to the markdown file. This matches default markdown
   * behaviour. If this is set to false, this behaviour is removed and URLs are no longer processed.
   * This allows to import images from `node_modules`. If this is disabled, local images can still
   * be imported by prepending the path with `./`.
   *
   * @default true
   */
  resolve?: boolean;
}

const urlPattern = /^(https?:)/;
const relativePathPattern = /\.\.?\//;

/**
 * A Remark plugin for converting Markdown images to MDX images using imports for the image source.
 */
const remarkMdxImages: Plugin<[RemarkMdxImagesOptions?], Root> =
  ({ resolve = true } = {}) =>
  (ast, file) => {
    const imports: MdxjsEsm[] = [];
    const imported = new Map<string, string>();
    visit(
      ast,
      'image',
      (node: Image, index: number | null, parent: Parent | null) => {
        let { alt = null, title, url } = node;
        console.log('Test 2', url);

        if (urlPattern.test(url)) {
          console.log('failes');
          return;
        }

        // if (url[0] === '/') {
        //   url = `/public${url}`;
        // } else
        // if (!relativePathPattern.test(url) && resolve) {
        //   url = `./${url}`;
        // }

        console.log('Test 3', url);

        let name = imported.get(url);
        if (!name) {
          name = `__${imported.size}_${url.replace(/\W/g, '_')}__`;

          imports.push({
            type: 'mdxjsEsm',
            value: '',
            data: {
              estree: {
                type: 'Program',
                sourceType: 'module',
                body: [
                  {
                    type: 'ImportDeclaration',
                    source: {
                      type: 'Literal',
                      value: url,
                      raw: JSON.stringify(url),
                    },
                    specifiers: [
                      {
                        type: 'ImportDefaultSpecifier',
                        local: { type: 'Identifier', name },
                      },
                    ],
                  },
                ],
              },
            },
          });
          imported.set(url, name);
        }

        const textElement: MdxJsxTextElement = {
          type: 'mdxJsxTextElement',
          name: 'img',
          children: [],
          attributes: [
            { type: 'mdxJsxAttribute', name: 'alt', value: alt },
            {
              type: 'mdxJsxAttribute',
              name: 'src',
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: name,
                data: {
                  estree: {
                    type: 'Program',
                    sourceType: 'module',
                    comments: [],
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: { type: 'Identifier', name },
                      },
                    ],
                  },
                },
              },
            },
          ],
        };
        if (title) {
          textElement.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'title',
            value: title,
          });
        }
        if (url[0] === '/') {
          url = `/public${url}`;
        }
        const imagePath = join(dirname(file.path), url);
        console.log('IMAGE path', imagePath);
        const imageSize = sizeOf(imagePath);
        console.log('IMAGE size', imageSize);

        textElement.attributes.push({
          type: 'mdxJsxAttribute',
          name: 'width',
          value: (imageSize?.width || 0).toString(),
        });
        textElement.attributes.push({
          type: 'mdxJsxAttribute',
          name: 'height',
          value: (imageSize?.height || 0).toString(),
        });

        parent!.children.splice(index!, 1, textElement);
      },
    );
    ast.children.unshift(...imports);
  };

export default remarkMdxImages;
