import type { PluginSimple } from 'markdown-it';
import { CONTAINER_CLASS, CONTENT_CLASS, FENCE_INFO, VIEW_CLASS } from '../constants';

/**
 * The markdown-it plugin.
 * @param markdownIt The markdown-it instance
 */
const plugin: PluginSimple = (markdownIt) => {
  const defaultRender =
    markdownIt.renderer.rules.fence ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  markdownIt.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    if (token.info !== FENCE_INFO) {
      return defaultRender(tokens, idx, options, env, self);
    }

    const metadata = document.createElement('pre');
    metadata.classList.add('joplin-source');
    metadata.classList.add(CONTENT_CLASS);
    metadata.setAttribute('data-joplin-language', FENCE_INFO);
    metadata.setAttribute('data-joplin-source-open', '```' + FENCE_INFO + '\n');
    metadata.setAttribute('data-joplin-source-close', '```');
    metadata.innerHTML = markdownIt.utils.escapeHtml(token.content);

    const view = document.createElement('div');
    view.classList.add(VIEW_CLASS);

    const viewPlaceholder = document.createElement('pre');
    viewPlaceholder.innerHTML = metadata.innerHTML;

    view.appendChild(viewPlaceholder);

    const container = document.createElement('div');
    container.classList.add('joplin-editable');
    container.classList.add(CONTAINER_CLASS);

    container.appendChild(metadata);
    container.appendChild(view);

    return container.outerHTML;
  };
};

export default () => {
  return {
    plugin,
    assets: () => [{ name: 'asyncRenderer.js' }],
  };
};
