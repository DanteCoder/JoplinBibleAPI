/**
 * Parses an xml bible to a JS object.
 * @param bibleFile The xml bible
 */
export const xmlBible2Js = (bibleFile: Uint8Array): any => {
  const decoder = new TextDecoder('utf-8');
  const decodedString = decoder.decode(bibleFile);

  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(decodedString, 'text/xml');

  const proxy = proxyGenerator(xmlDocument);

  return proxy.osisText?.[0];
};

/**
 * Creates a proxy for an Element.
 * The $ property returns the attributes of the element.
 * The _ property returns the innerHTML of the element.
 * Any other string properties will return the query selector for all the matching elements.
 * @param elementToProxy The xml document or an element
 */
const proxyGenerator = (elementToProxy: Document | Element) => {
  const proxy = new Proxy<any>(elementToProxy, {
    get(element: Element, key: string) {
      if (key === '$') {
        return getElementAttributes(element);
      }

      if (key === '_') {
        return element.innerHTML;
      }

      const queryResult = [...element.querySelectorAll(`:scope > ${key}`)].map((element) => {
        return proxyGenerator(element);
      });

      if (!queryResult.length) {
        return undefined;
      }

      return queryResult;
    },
  });

  return proxy as ElementProxy;
};

/**
 * Returns the attributes of an element as object.
 * @param element The element to get the attributes from
 */
const getElementAttributes = (element: Element | null) => {
  if (!element) {
    return {};
  }

  return [...element.attributes].reduce<Record<string, string>>((acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {});
};
