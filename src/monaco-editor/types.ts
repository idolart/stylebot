export type IframeCssUpdatedMessage = {
  type: 'stylebotMonacoIframeCssUpdated';
  css: string;
};

export type IframeLoadedMessage = {
  type: 'stylebotMonacoIframeLoaded';
};

export type IframeMessageType = IframeCssUpdatedMessage | IframeLoadedMessage;

export type ParentUpdateCssMessage = {
  type: 'stylebotCssUpdate';
  css: string;
};