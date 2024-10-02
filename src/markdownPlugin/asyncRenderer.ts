import { CONTAINER_CLASS, CONTENT_CLASS, CONTENT_SCRIPT_ID, VIEW_CLASS } from '../constants';

declare const webviewApi: {
  postMessage: (contentScriptId: string, message: number | string | object) => Promise<any>;
};

/**
 * Renders all the Bible blocks in the document.
 */
const renderBibleBlocks = async () => {
  const bibleBlocks = [...document.getElementsByClassName(CONTAINER_CLASS)] as HTMLDivElement[];

  try {
    await Promise.all(bibleBlocks.map((b) => renderBlock(b)));
  } catch (error) {
    console.error(error);
  }
};

/**
 * Renders a single Bible block, making a request to the main plugin.
 * @param blockContent The text content of the Bible block
 */
const renderBlock = async (block: HTMLDivElement) => {
  const content = block.querySelector(`.${CONTENT_CLASS}`)!.textContent ?? '';
  const viewElement = block.querySelector(`.${VIEW_CLASS}`)!;

  const message: MdPostMessage = {
    type: 'parseBlock',
    content: content,
  };

  const response = await webviewApi.postMessage(CONTENT_SCRIPT_ID, message);

  viewElement.innerHTML = response;
};

/**
 * Initializes the renderer.
 */
const init = () => {
  document.addEventListener('joplin-noteDidUpdate', renderBibleBlocks);

  if (document.readyState === 'complete') {
    renderBibleBlocks();
    return;
  }

  document.addEventListener('load', renderBibleBlocks);
};

init();
