/**
 * A parsed xml element.
 */
type ElementProxy = {
  [key: string]: ElementProxy[] | undefined;
} & ElementProxyProps;

/**
 * The properties of a parsed element.
 */
type ElementProxyProps = {
  $: Record<string, string>;
  _: string;
};
