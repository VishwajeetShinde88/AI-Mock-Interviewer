import { GoogleAuthOptions } from 'google-auth-library';

/** Marks the end of user activity.

 This can only be sent if automatic (i.e. server-side) activity detection is
 disabled.
 */
export declare interface ActivityEnd {
}

/** The different ways of handling user activity. */
export declare enum ActivityHandling {
    ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED",
    START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS",
    NO_INTERRUPTION = "NO_INTERRUPTION"
}

/** Marks the start of user activity.

 This can only be sent if automatic (i.e. server-side) activity detection is
 disabled.
 */
export declare interface ActivityStart {
}

/** Optional. Adapter size for tuning. */
export declare enum AdapterSize {
    ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED",
    ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE",
    ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO",
    ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR",
    ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT",
    ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN",
    ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO"
}

/**
 * The ApiClient class is used to send requests to the Gemini API or Vertex AI
 * endpoints.
 */
declare class ApiClient {
    readonly clientOptions: ApiClientInitOptions;
    constructor(opts: ApiClientInitOptions);
    /**
     * Determines the base URL for Vertex AI based on project and location.
     * Uses the global endpoint if location is 'global' or if project/location
     * are not specified (implying API key usage).
     * @private
     */
    private baseUrlFromProjectLocation;
    /**
     * Normalizes authentication parameters for Vertex AI.
     * If project and location are provided, API key is cleared.
     * If project and location are not provided (implying API key usage),
     * project and location are cleared.
     * @private
     */
    private normalizeAuthParameters;
    isVertexAI(): boolean;
    getProject(): string | undefined;
    getLocation(): string | undefined;
    getApiVersion(): string;
    getBaseUrl(): string;
    getRequestUrl(): string;
    getHeaders(): Record<string, string>;
    private getRequestUrlInternal;
    getBaseResourcePath(): string;
    getApiKey(): string | undefined;
    getWebsocketBaseUrl(): string;
    setBaseUrl(url: string): void;
    private constructUrl;
    private shouldPrependVertexProjectPath;
    request(request: HttpRequest): Promise<HttpResponse>;
    private patchHttpOptions;
    requestStream(request: HttpRequest): Promise<AsyncGenerator<HttpResponse>>;
    private includeExtraHttpOptionsToRequestInit;
    private unaryApiCall;
    private streamApiCall;
    processStreamResponse(response: Response): AsyncGenerator<HttpResponse>;
    private apiCall;
    getDefaultHeaders(): Record<string, string>;
    private getHeadersInternal;
    /**
     * Uploads a file asynchronously using Gemini API only, this is not supported
     * in Vertex AI.
     *
     * @param file The string path to the file to be uploaded or a Blob object.
     * @param config Optional parameters specified in the `UploadFileConfig`
     *     interface. @see {@link UploadFileConfig}
     * @return A promise that resolves to a `File` object.
     * @throws An error if called on a Vertex AI client.
     * @throws An error if the `mimeType` is not provided and can not be inferred,
     */
    uploadFile(file: string | Blob, config?: UploadFileConfig): Promise<File_2>;
    /**
     * Downloads a file asynchronously to the specified path.
     *
     * @params params - The parameters for the download request, see {@link
     * DownloadFileParameters}
     */
    downloadFile(params: DownloadFileParameters): Promise<void>;
    private fetchUploadUrl;
}

/**
 * Options for initializing the ApiClient. The ApiClient uses the parameters
 * for authentication purposes as well as to infer if SDK should send the
 * request to Vertex AI or Gemini API.
 */
declare interface ApiClientInitOptions {
    /**
     * The object used for adding authentication headers to API requests.
     */
    auth: Auth;
    /**
     * The uploader to use for uploading files. This field is required for
     * creating a client, will be set through the Node_client or Web_client.
     */
    uploader: Uploader;
    /**
     * Optional. The downloader to use for downloading files. This field is
     * required for creating a client, will be set through the Node_client or
     * Web_client.
     */
    downloader: Downloader;
    /**
     * Optional. The Google Cloud project ID for Vertex AI users.
     * It is not the numeric project name.
     * If not provided, SDK will try to resolve it from runtime environment.
     */
    project?: string;
    /**
     * Optional. The Google Cloud project location for Vertex AI users.
     * If not provided, SDK will try to resolve it from runtime environment.
     */
    location?: string;
    /**
     * The API Key. This is required for Gemini API users.
     */
    apiKey?: string;
    /**
     * Optional. Set to true if you intend to call Vertex AI endpoints.
     * If unset, default SDK behavior is to call Gemini API.
     */
    vertexai?: boolean;
    /**
     * Optional. The API version for the endpoint.
     * If unset, SDK will choose a default api version.
     */
    apiVersion?: string;
    /**
     * Optional. A set of customizable configuration for HTTP requests.
     */
    httpOptions?: HttpOptions;
    /**
     * Optional. An extra string to append at the end of the User-Agent header.
     *
     * This can be used to e.g specify the runtime and its version.
     */
    userAgentExtra?: string;
}

/** Config for authentication with API key. */
export declare interface ApiKeyConfig {
    /** The API key to be used in the request directly. */
    apiKeyString?: string;
}

/** The audio transcription configuration in Setup. */
export declare interface AudioTranscriptionConfig {
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * The Auth interface is used to authenticate with the API service.
 */
declare interface Auth {
    /**
     * Sets the headers needed to authenticate with the API service.
     *
     * @param headers - The Headers object that will be updated with the authentication headers.
     */
    addAuthHeaders(headers: Headers): Promise<void>;
}

/** Auth configuration to run the extension. */
export declare interface AuthConfig {
    /** Config for API key auth. */
    apiKeyConfig?: ApiKeyConfig;
    /** Type of auth scheme. */
    authType?: AuthType;
    /** Config for Google Service Account auth. */
    googleServiceAccountConfig?: AuthConfigGoogleServiceAccountConfig;
    /** Config for HTTP Basic auth. */
    httpBasicAuthConfig?: AuthConfigHttpBasicAuthConfig;
    /** Config for user oauth. */
    oauthConfig?: AuthConfigOauthConfig;
    /** Config for user OIDC auth. */
    oidcConfig?: AuthConfigOidcConfig;
}

/** Config for Google Service Account Authentication. */
export declare interface AuthConfigGoogleServiceAccountConfig {
    /** Optional. The service account that the extension execution service runs as. - If the service account is specified, the `iam.serviceAccounts.getAccessToken` permission should be granted to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents) on the specified service account. - If not specified, the Vertex AI Extension Service Agent will be used to execute the Extension. */
    serviceAccount?: string;
}

/** Config for HTTP Basic Authentication. */
export declare interface AuthConfigHttpBasicAuthConfig {
    /** Required. The name of the SecretManager secret version resource storing the base64 encoded credentials. Format: `projects/{project}/secrets/{secrete}/versions/{version}` - If specified, the `secretmanager.versions.access` permission should be granted to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents) on the specified resource. */
    credentialSecret?: string;
}

/** Config for user oauth. */
export declare interface AuthConfigOauthConfig {
    /** Access token for extension endpoint. Only used to propagate token from [[ExecuteExtensionRequest.runtime_auth_config]] at request time. */
    accessToken?: string;
    /** The service account used to generate access tokens for executing the Extension. - If the service account is specified, the `iam.serviceAccounts.getAccessToken` permission should be granted to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents) on the provided service account. */
    serviceAccount?: string;
}

/** Config for user OIDC auth. */
export declare interface AuthConfigOidcConfig {
    /** OpenID Connect formatted ID token for extension endpoint. Only used to propagate token from [[ExecuteExtensionRequest.runtime_auth_config]] at request time. */
    idToken?: string;
    /** The service account used to generate an OpenID Connect (OIDC)-compatible JWT token signed by the Google OIDC Provider (accounts.google.com) for extension endpoint (https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#sa-credentials-oidc). - The audience for the token will be set to the URL in the server url defined in the OpenApi spec. - If the service account is provided, the service account should grant `iam.serviceAccounts.getOpenIdToken` permission to Vertex AI Extension Service Agent (https://cloud.google.com/vertex-ai/docs/general/access-control#service-agents). */
    serviceAccount?: string;
}

/** Type of auth scheme. */
export declare enum AuthType {
    AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED",
    NO_AUTH = "NO_AUTH",
    API_KEY_AUTH = "API_KEY_AUTH",
    HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH",
    GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH",
    OAUTH = "OAUTH",
    OIDC_AUTH = "OIDC_AUTH"
}

/** Configures automatic detection of activity. */
export declare interface AutomaticActivityDetection {
    /** If enabled, detected voice and text input count as activity. If disabled, the client must send activity signals. */
    disabled?: boolean;
    /** Determines how likely speech is to be detected. */
    startOfSpeechSensitivity?: StartSensitivity;
    /** Determines how likely detected speech is ended. */
    endOfSpeechSensitivity?: EndSensitivity;
    /** The required duration of detected speech before start-of-speech is committed. The lower this value the more sensitive the start-of-speech detection is and the shorter speech can be recognized. However, this also increases the probability of false positives. */
    prefixPaddingMs?: number;
    /** The required duration of detected non-speech (e.g. silence) before end-of-speech is committed. The larger this value, the longer speech gaps can be without interrupting the user's activity but this will increase the model's latency. */
    silenceDurationMs?: number;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
declare class BaseModule {
}

/**
 * Parameters for setting the base URLs for the Gemini API and Vertex AI API.
 */
export declare interface BaseUrlParameters {
    geminiUrl?: string;
    vertexUrl?: string;
}

/** Content blob. */
declare interface Blob_2 {
    /** Required. Raw bytes. */
    data?: string;
    /** Required. The IANA standard MIME type of the source data. */
    mimeType?: string;
}
export { Blob_2 as Blob }

export declare type BlobImageUnion = Blob_2;

/** Output only. Blocked reason. */
export declare enum BlockedReason {
    BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED",
    SAFETY = "SAFETY",
    OTHER = "OTHER",
    BLOCKLIST = "BLOCKLIST",
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT"
}

/** A resource used in LLM queries for users to explicitly specify what to cache. */
export declare interface CachedContent {
    /** The server-generated resource name of the cached content. */
    name?: string;
    /** The user-generated meaningful display name of the cached content. */
    displayName?: string;
    /** The name of the publisher model to use for cached content. */
    model?: string;
    /** Creation time of the cache entry. */
    createTime?: string;
    /** When the cache entry was last updated in UTC time. */
    updateTime?: string;
    /** Expiration time of the cached content. */
    expireTime?: string;
    /** Metadata on the usage of the cached content. */
    usageMetadata?: CachedContentUsageMetadata;
}

/** Metadata on the usage of the cached content. */
export declare interface CachedContentUsageMetadata {
    /** Duration of audio in seconds. */
    audioDurationSeconds?: number;
    /** Number of images. */
    imageCount?: number;
    /** Number of text characters. */
    textCount?: number;
    /** Total number of tokens that the cached content consumes. */
    totalTokenCount?: number;
    /** Duration of video in seconds. */
    videoDurationSeconds?: number;
}

export declare class Caches extends BaseModule {
    private readonly apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Lists cached content configurations.
     *
     * @param params - The parameters for the list request.
     * @return The paginated results of the list of cached contents.
     *
     * @example
     * ```ts
     * const cachedContents = await ai.caches.list({config: {'pageSize': 2}});
     * for (const cachedContent of cachedContents) {
     *   console.log(cachedContent);
     * }
     * ```
     */
    list: (params?: types.ListCachedContentsParameters) => Promise<Pager<types.CachedContent>>;
    /**
     * Creates a cached contents resource.
     *
     * @remarks
     * Context caching is only supported for specific models. See [Gemini
     * Developer API reference](https://ai.google.dev/gemini-api/docs/caching?lang=node/context-cac)
     * and [Vertex AI reference](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview#supported_models)
     * for more information.
     *
     * @param params - The parameters for the create request.
     * @return The created cached content.
     *
     * @example
     * ```ts
     * const contents = ...; // Initialize the content to cache.
     * const response = await ai.caches.create({
     *   model: 'gemini-2.0-flash-001',
     *   config: {
     *    'contents': contents,
     *    'displayName': 'test cache',
     *    'systemInstruction': 'What is the sum of the two pdfs?',
     *    'ttl': '86400s',
     *  }
     * });
     * ```
     */
    create(params: types.CreateCachedContentParameters): Promise<types.CachedContent>;
    /**
     * Gets cached content configurations.
     *
     * @param params - The parameters for the get request.
     * @return The cached content.
     *
     * @example
     * ```ts
     * await ai.caches.get({name: '...'}); // The server-generated resource name.
     * ```
     */
    get(params: types.GetCachedContentParameters): Promise<types.CachedContent>;
    /**
     * Deletes cached content.
     *
     * @param params - The parameters for the delete request.
     * @return The empty response returned by the API.
     *
     * @example
     * ```ts
     * await ai.caches.delete({name: '...'}); // The server-generated resource name.
     * ```
     */
    delete(params: types.DeleteCachedContentParameters): Promise<types.DeleteCachedContentResponse>;
    /**
     * Updates cached content configurations.
     *
     * @param params - The parameters for the update request.
     * @return The updated cached content.
     *
     * @example
     * ```ts
     * const response = await ai.caches.update({
     *   name: '...',  // The server-generated resource name.
     *   config: {'ttl': '7600s'}
     * });
     * ```
     */
    update(params: types.UpdateCachedContentParameters): Promise<types.CachedContent>;
    private listInternal;
}

/** A response candidate generated from the model. */
export declare interface Candidate {
    /** Contains the multi-part content of the response.
     */
    content?: Content;
    /** Source attribution of the generated content.
     */
    citationMetadata?: CitationMetadata;
    /** Describes the reason the model stopped generating tokens.
     */
    finishMessage?: string;
    /** Number of tokens for this candidate.
     */
    tokenCount?: number;
    /** The reason why the model stopped generating tokens.
     If empty, the model has not stopped generating the tokens.
     */
    finishReason?: FinishReason;
    /** Output only. Average log probability score of the candidate. */
    avgLogprobs?: number;
    /** Output only. Metadata specifies sources used to ground generated content. */
    groundingMetadata?: GroundingMetadata;
    /** Output only. Index of the candidate. */
    index?: number;
    /** Output only. Log-likelihood scores for the response tokens and top tokens */
    logprobsResult?: LogprobsResult;
    /** Output only. List of ratings for the safety of a response candidate. There is at most one rating per category. */
    safetyRatings?: SafetyRating[];
}

/**
 * Chat session that enables sending messages to the model with previous
 * conversation context.
 *
 * @remarks
 * The session maintains all the turns between user and model.
 */
export declare class Chat {
    private readonly apiClient;
    private readonly modelsModule;
    private readonly model;
    private readonly config;
    private history;
    private sendPromise;
    constructor(apiClient: ApiClient, modelsModule: Models, model: string, config?: types.GenerateContentConfig, history?: types.Content[]);
    /**
     * Sends a message to the model and returns the response.
     *
     * @remarks
     * This method will wait for the previous message to be processed before
     * sending the next message.
     *
     * @see {@link Chat#sendMessageStream} for streaming method.
     * @param params - parameters for sending messages within a chat session.
     * @returns The model's response.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
     * const response = await chat.sendMessage({
     *   message: 'Why is the sky blue?'
     * });
     * console.log(response.text);
     * ```
     */
    sendMessage(params: types.SendMessageParameters): Promise<types.GenerateContentResponse>;
    /**
     * Sends a message to the model and returns the response in chunks.
     *
     * @remarks
     * This method will wait for the previous message to be processed before
     * sending the next message.
     *
     * @see {@link Chat#sendMessage} for non-streaming method.
     * @param params - parameters for sending the message.
     * @return The model's response.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
     * const response = await chat.sendMessageStream({
     *   message: 'Why is the sky blue?'
     * });
     * for await (const chunk of response) {
     *   console.log(chunk.text);
     * }
     * ```
     */
    sendMessageStream(params: types.SendMessageParameters): Promise<AsyncGenerator<types.GenerateContentResponse>>;
    /**
     * Returns the chat history.
     *
     * @remarks
     * The history is a list of contents alternating between user and model.
     *
     * There are two types of history:
     * - The `curated history` contains only the valid turns between user and
     * model, which will be included in the subsequent requests sent to the model.
     * - The `comprehensive history` contains all turns, including invalid or
     *   empty model outputs, providing a complete record of the history.
     *
     * The history is updated after receiving the response from the model,
     * for streaming response, it means receiving the last chunk of the response.
     *
     * The `comprehensive history` is returned by default. To get the `curated
     * history`, set the `curated` parameter to `true`.
     *
     * @param curated - whether to return the curated history or the comprehensive
     *     history.
     * @return History contents alternating between user and model for the entire
     *     chat session.
     */
    getHistory(curated?: boolean): types.Content[];
    private processStreamResponse;
    private recordHistory;
}

/**
 * A utility class to create a chat session.
 */
export declare class Chats {
    private readonly modelsModule;
    private readonly apiClient;
    constructor(modelsModule: Models, apiClient: ApiClient);
    /**
     * Creates a new chat session.
     *
     * @remarks
     * The config in the params will be used for all requests within the chat
     * session unless overridden by a per-request `config` in
     * @see {@link types.SendMessageParameters#config}.
     *
     * @param params - Parameters for creating a chat session.
     * @returns A new chat session.
     *
     * @example
     * ```ts
     * const chat = ai.chats.create({
     *   model: 'gemini-2.0-flash'
     *   config: {
     *     temperature: 0.5,
     *     maxOutputTokens: 1024,
     *   }
     * });
     * ```
     */
    create(params: types.CreateChatParameters): Chat;
}

/** Source attributions for content. */
export declare interface Citation {
    /** Output only. End index into the content. */
    endIndex?: number;
    /** Output only. License of the attribution. */
    license?: string;
    /** Output only. Publication date of the attribution. */
    publicationDate?: GoogleTypeDate;
    /** Output only. Start index into the content. */
    startIndex?: number;
    /** Output only. Title of the attribution. */
    title?: string;
    /** Output only. Url reference of the attribution. */
    uri?: string;
}

/** Citation information when the model quotes another source. */
export declare interface CitationMetadata {
    /** Contains citation information when the model directly quotes, at
     length, from another source. Can include traditional websites and code
     repositories.
     */
    citations?: Citation[];
}

/** Result of executing the [ExecutableCode]. Always follows a `part` containing the [ExecutableCode]. */
export declare interface CodeExecutionResult {
    /** Required. Outcome of the code execution. */
    outcome?: Outcome;
    /** Optional. Contains stdout when code execution is successful, stderr or other description otherwise. */
    output?: string;
}

/** Optional parameters for computing tokens. */
export declare interface ComputeTokensConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters for computing tokens. */
export declare interface ComputeTokensParameters {
    /** ID of the model to use. For a list of models, see `Google models
     <https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models>`_. */
    model: string;
    /** Input content. */
    contents: ContentListUnion;
    /** Optional parameters for the request.
     */
    config?: ComputeTokensConfig;
}

/** Response for computing tokens. */
export declare class ComputeTokensResponse {
    /** Lists of tokens info from the input. A ComputeTokensRequest could have multiple instances with a prompt in each instance. We also need to return lists of tokens info for the request with multiple instances. */
    tokensInfo?: TokensInfo[];
}

/** Contains the multi-part content of a message. */
export declare interface Content {
    /** List of parts that constitute a single message. Each part may have
     a different IANA MIME type. */
    parts?: Part[];
    /** Optional. The producer of the content. Must be either 'user' or
     'model'. Useful to set for multi-turn conversations, otherwise can be
     empty. If role is not specified, SDK will determine the role. */
    role?: string;
}

/** The embedding generated from an input content. */
export declare interface ContentEmbedding {
    /** A list of floats representing an embedding.
     */
    values?: number[];
    /** Vertex API only. Statistics of the input text associated with this
     embedding.
     */
    statistics?: ContentEmbeddingStatistics;
}

/** Statistics of the input text associated with the result of content embedding. */
export declare interface ContentEmbeddingStatistics {
    /** Vertex API only. If the input text was truncated due to having
     a length longer than the allowed maximum input.
     */
    truncated?: boolean;
    /** Vertex API only. Number of tokens of the input text.
     */
    tokenCount?: number;
}

export declare type ContentListUnion = Content | Content[] | PartUnion | PartUnion[];

export declare type ContentUnion = Content | PartUnion[] | PartUnion;

/** Enables context window compression -- mechanism managing model context window so it does not exceed given length. */
export declare interface ContextWindowCompressionConfig {
    /** Number of tokens (before running turn) that triggers context window compression mechanism. */
    triggerTokens?: string;
    /** Sliding window compression mechanism. */
    slidingWindow?: SlidingWindow;
}

/** Configuration for a Control reference image. */
export declare interface ControlReferenceConfig {
    /** The type of control reference image to use. */
    controlType?: ControlReferenceType;
    /** Defaults to False. When set to True, the control image will be
     computed by the model based on the control type. When set to False,
     the control image must be provided by the user. */
    enableControlImageComputation?: boolean;
}

/** A control reference image.

 The image of the control reference image is either a control image provided
 by the user, or a regular image which the backend will use to generate a
 control image of. In the case of the latter, the
 enable_control_image_computation field in the config should be set to True.

 A control image is an image that represents a sketch image of areas for the
 model to fill in based on the prompt.
 */
export declare interface ControlReferenceImage {
    /** The reference image for the editing operation. */
    referenceImage?: Image_2;
    /** The id of the reference image. */
    referenceId?: number;
    /** The type of the reference image. Only set by the SDK. */
    referenceType?: string;
    /** Configuration for the control reference image. */
    config?: ControlReferenceConfig;
}

/** Enum representing the control type of a control reference image. */
export declare enum ControlReferenceType {
    CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT",
    CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY",
    CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE",
    CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH"
}

/** Config for the count_tokens method. */
export declare interface CountTokensConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** Instructions for the model to steer it toward better performance.
     */
    systemInstruction?: ContentUnion;
    /** Code that enables the system to interact with external systems to
     perform an action outside of the knowledge and scope of the model.
     */
    tools?: Tool[];
    /** Configuration that the model uses to generate the response. Not
     supported by the Gemini Developer API.
     */
    generationConfig?: GenerationConfig;
}

/** Parameters for counting tokens. */
export declare interface CountTokensParameters {
    /** ID of the model to use. For a list of models, see `Google models
     <https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models>`_. */
    model: string;
    /** Input content. */
    contents: ContentListUnion;
    /** Configuration for counting tokens. */
    config?: CountTokensConfig;
}

/** Response for counting tokens. */
export declare class CountTokensResponse {
    /** Total number of tokens. */
    totalTokens?: number;
    /** Number of tokens in the cached part of the prompt (the cached content). */
    cachedContentTokenCount?: number;
}

/** Optional configuration for cached content creation. */
export declare interface CreateCachedContentConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** The TTL for this resource. The expiration time is computed: now + TTL. It is a duration string, with up to nine fractional digits, terminated by 's'. Example: "3.5s". */
    ttl?: string;
    /** Timestamp of when this resource is considered expired. Uses RFC 3339 format, Example: 2014-10-02T15:01:23Z. */
    expireTime?: string;
    /** The user-generated meaningful display name of the cached content.
     */
    displayName?: string;
    /** The content to cache.
     */
    contents?: ContentListUnion;
    /** Developer set system instruction.
     */
    systemInstruction?: ContentUnion;
    /** A list of `Tools` the model may use to generate the next response.
     */
    tools?: Tool[];
    /** Configuration for the tools to use. This config is shared for all tools.
     */
    toolConfig?: ToolConfig;
}

/** Parameters for caches.create method. */
export declare interface CreateCachedContentParameters {
    /** ID of the model to use. Example: gemini-2.0-flash */
    model: string;
    /** Configuration that contains optional parameters.
     */
    config?: CreateCachedContentConfig;
}

/** Parameters for initializing a new chat session.

 These parameters are used when creating a chat session with the
 `chats.create()` method.
 */
export declare interface CreateChatParameters {
    /** The name of the model to use for the chat session.

     For example: 'gemini-2.0-flash', 'gemini-2.0-flash-lite', etc. See Gemini API
     docs to find the available models.
     */
    model: string;
    /** Config for the entire chat session.

     This config applies to all requests within the session
     unless overridden by a per-request `config` in `SendMessageParameters`.
     */
    config?: GenerateContentConfig;
    /** The initial conversation history for the chat session.

     This allows you to start the chat with a pre-existing history. The history
     must be a list of `Content` alternating between 'user' and 'model' roles.
     It should start with a 'user' message.
     */
    history?: Content[];
}

/** Used to override the default configuration. */
export declare interface CreateFileConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Generates the parameters for the private _create method. */
export declare interface CreateFileParameters {
    /** The file to be uploaded.
     mime_type: (Required) The MIME type of the file. Must be provided.
     name: (Optional) The name of the file in the destination (e.g.
     'files/sample-image').
     display_name: (Optional) The display name of the file.
     */
    file: File_2;
    /** Used to override the default configuration. */
    config?: CreateFileConfig;
}

/** Response for the create file method. */
export declare class CreateFileResponse {
    /** Used to retain the full HTTP response. */
    sdkHttpResponse?: HttpResponse;
}

/**
 * Creates a `Content` object with a model role from a `PartListUnion` object or `string`.
 */
export declare function createModelContent(partOrString: PartListUnion | string): Content;

/**
 * Creates a `Part` object from a `base64` encoded `string`.
 */
export declare function createPartFromBase64(data: string, mimeType: string): Part;

/**
 * Creates a `Part` object from the `outcome` and `output` of a `CodeExecutionResult` object.
 */
export declare function createPartFromCodeExecutionResult(outcome: Outcome, output: string): Part;

/**
 * Creates a `Part` object from the `code` and `language` of an `ExecutableCode` object.
 */
export declare function createPartFromExecutableCode(code: string, language: Language): Part;

/**
 * Creates a `Part` object from a `FunctionCall` object.
 */
export declare function createPartFromFunctionCall(name: string, args: Record<string, unknown>): Part;

/**
 * Creates a `Part` object from a `FunctionResponse` object.
 */
export declare function createPartFromFunctionResponse(id: string, name: string, response: Record<string, unknown>): Part;

/**
 * Creates a `Part` object from a `text` string.
 */
export declare function createPartFromText(text: string): Part;

/**
 * Creates a `Part` object from a `URI` string.
 */
export declare function createPartFromUri(uri: string, mimeType: string): Part;

/** Supervised fine-tuning job creation request - optional fields. */
export declare interface CreateTuningJobConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** Cloud Storage path to file containing training dataset for tuning. The dataset must be formatted as a JSONL file. */
    validationDataset?: TuningValidationDataset;
    /** The display name of the tuned Model. The name can be up to 128 characters long and can consist of any UTF-8 characters. */
    tunedModelDisplayName?: string;
    /** The description of the TuningJob */
    description?: string;
    /** Number of complete passes the model makes over the entire training dataset during training. */
    epochCount?: number;
    /** Multiplier for adjusting the default learning rate. */
    learningRateMultiplier?: number;
    /** Adapter size for tuning. */
    adapterSize?: AdapterSize;
    /** The batch size hyperparameter for tuning. If not set, a default of 4 or 16 will be used based on the number of training examples. */
    batchSize?: number;
    /** The learning rate hyperparameter for tuning. If not set, a default of 0.001 or 0.0002 will be calculated based on the number of training examples. */
    learningRate?: number;
}

/** Supervised fine-tuning job creation parameters - optional fields. */
export declare interface CreateTuningJobParameters {
    /** The base model that is being tuned, e.g., "gemini-1.0-pro-002". */
    baseModel: string;
    /** Cloud Storage path to file containing training dataset for tuning. The dataset must be formatted as a JSONL file. */
    trainingDataset: TuningDataset;
    /** Configuration for the tuning job. */
    config?: CreateTuningJobConfig;
}

/**
 * Creates a `Content` object with a user role from a `PartListUnion` object or `string`.
 */
export declare function createUserContent(partOrString: PartListUnion | string): Content;

/** Distribution computed over a tuning dataset. */
export declare interface DatasetDistribution {
    /** Output only. Defines the histogram bucket. */
    buckets?: DatasetDistributionDistributionBucket[];
    /** Output only. The maximum of the population values. */
    max?: number;
    /** Output only. The arithmetic mean of the values in the population. */
    mean?: number;
    /** Output only. The median of the values in the population. */
    median?: number;
    /** Output only. The minimum of the population values. */
    min?: number;
    /** Output only. The 5th percentile of the values in the population. */
    p5?: number;
    /** Output only. The 95th percentile of the values in the population. */
    p95?: number;
    /** Output only. Sum of a given population of values. */
    sum?: number;
}

/** Dataset bucket used to create a histogram for the distribution given a population of values. */
export declare interface DatasetDistributionDistributionBucket {
    /** Output only. Number of values in the bucket. */
    count?: string;
    /** Output only. Left bound of the bucket. */
    left?: number;
    /** Output only. Right bound of the bucket. */
    right?: number;
}

/** Statistics computed over a tuning dataset. */
export declare interface DatasetStats {
    /** Output only. Number of billable characters in the tuning dataset. */
    totalBillableCharacterCount?: string;
    /** Output only. Number of tuning characters in the tuning dataset. */
    totalTuningCharacterCount?: string;
    /** Output only. Number of examples in the tuning dataset. */
    tuningDatasetExampleCount?: string;
    /** Output only. Number of tuning steps for this Tuning Job. */
    tuningStepCount?: string;
    /** Output only. Sample user messages in the training dataset uri. */
    userDatasetExamples?: Content[];
    /** Output only. Dataset distributions for the user input tokens. */
    userInputTokenDistribution?: DatasetDistribution;
    /** Output only. Dataset distributions for the messages per example. */
    userMessagePerExampleDistribution?: DatasetDistribution;
    /** Output only. Dataset distributions for the user output tokens. */
    userOutputTokenDistribution?: DatasetDistribution;
}

/** Optional parameters for caches.delete method. */
export declare interface DeleteCachedContentConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters for caches.delete method. */
export declare interface DeleteCachedContentParameters {
    /** The server-generated resource name of the cached content.
     */
    name: string;
    /** Optional parameters for the request.
     */
    config?: DeleteCachedContentConfig;
}

/** Empty response for caches.delete method. */
export declare class DeleteCachedContentResponse {
}

/** Used to override the default configuration. */
export declare interface DeleteFileConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Generates the parameters for the get method. */
export declare interface DeleteFileParameters {
    /** The name identifier for the file to be deleted. */
    name: string;
    /** Used to override the default configuration. */
    config?: DeleteFileConfig;
}

/** Response for the delete file method. */
export declare class DeleteFileResponse {
}

/** Configuration for deleting a tuned model. */
export declare interface DeleteModelConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters for deleting a tuned model. */
export declare interface DeleteModelParameters {
    model: string;
    /** Optional parameters for the request. */
    config?: DeleteModelConfig;
}

export declare class DeleteModelResponse {
}

/** Statistics computed for datasets used for distillation. */
export declare interface DistillationDataStats {
    /** Output only. Statistics computed for the training dataset. */
    trainingDatasetStats?: DatasetStats;
}

/** Hyperparameters for Distillation. */
export declare interface DistillationHyperParameters {
    /** Optional. Adapter size for distillation. */
    adapterSize?: AdapterSize;
    /** Optional. Number of complete passes the model makes over the entire training dataset during training. */
    epochCount?: string;
    /** Optional. Multiplier for adjusting the default learning rate. */
    learningRateMultiplier?: number;
}

/** Tuning Spec for Distillation. */
export declare interface DistillationSpec {
    /** The base teacher model that is being distilled, e.g., "gemini-1.0-pro-002". */
    baseTeacherModel?: string;
    /** Optional. Hyperparameters for Distillation. */
    hyperParameters?: DistillationHyperParameters;
    /** Required. A path in a Cloud Storage bucket, which will be treated as the root output directory of the distillation pipeline. It is used by the system to generate the paths of output artifacts. */
    pipelineRootDirectory?: string;
    /** The student model that is being tuned, e.g., "google/gemma-2b-1.1-it". */
    studentModel?: string;
    /** Required. Cloud Storage path to file containing training dataset for tuning. The dataset must be formatted as a JSONL file. */
    trainingDatasetUri?: string;
    /** The resource name of the Tuned teacher model. Format: `projects/{project}/locations/{location}/models/{model}`. */
    tunedTeacherModelSource?: string;
    /** Optional. Cloud Storage path to file containing validation dataset for tuning. The dataset must be formatted as a JSONL file. */
    validationDatasetUri?: string;
}

export declare type DownloadableFileUnion = string | File_2 | GeneratedVideo | Video;

declare interface Downloader {
    /**
     * Downloads a file to the given location.
     *
     * @param params The parameters for downloading the file.
     * @param apiClient The ApiClient to use for uploading.
     * @return A Promises that resolves when the download is complete.
     */
    download(params: DownloadFileParameters, apiClient: ApiClient): Promise<void>;
}

/** Used to override the default configuration. */
export declare interface DownloadFileConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters used to download a file. */
export declare interface DownloadFileParameters {
    /** The file to download. It can be a file name, a file object or a generated video. */
    file: DownloadableFileUnion;
    /** Location where the file should be downloaded to. */
    downloadPath: string;
    /** Configuration to for the download operation. */
    config?: DownloadFileConfig;
}

/** Describes the options to customize dynamic retrieval. */
export declare interface DynamicRetrievalConfig {
    /** The mode of the predictor to be used in dynamic retrieval. */
    mode?: DynamicRetrievalConfigMode;
    /** Optional. The threshold to be used in dynamic retrieval. If not set, a system default value is used. */
    dynamicThreshold?: number;
}

/** Config for the dynamic retrieval config mode. */
export declare enum DynamicRetrievalConfigMode {
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED",
    MODE_DYNAMIC = "MODE_DYNAMIC"
}

export declare interface EmbedContentConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** Type of task for which the embedding will be used.
     */
    taskType?: string;
    /** Title for the text. Only applicable when TaskType is
     `RETRIEVAL_DOCUMENT`.
     */
    title?: string;
    /** Reduced dimension for the output embedding. If set,
     excessive values in the output embedding are truncated from the end.
     Supported by newer models since 2024 only. You cannot set this value if
     using the earlier model (`models/embedding-001`).
     */
    outputDimensionality?: number;
    /** Vertex API only. The MIME type of the input.
     */
    mimeType?: string;
    /** Vertex API only. Whether to silently truncate inputs longer than
     the max sequence length. If this option is set to false, oversized inputs
     will lead to an INVALID_ARGUMENT error, similar to other text APIs.
     */
    autoTruncate?: boolean;
}

/** Request-level metadata for the Vertex Embed Content API. */
export declare interface EmbedContentMetadata {
    /** Vertex API only. The total number of billable characters included
     in the request.
     */
    billableCharacterCount?: number;
}

/** Parameters for the embed_content method. */
export declare interface EmbedContentParameters {
    /** ID of the model to use. For a list of models, see `Google models
     <https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models>`_. */
    model: string;
    /** The content to embed. Only the `parts.text` fields will be counted.
     */
    contents: ContentListUnion;
    /** Configuration that contains optional parameters.
     */
    config?: EmbedContentConfig;
}

/** Response for the embed_content method. */
export declare class EmbedContentResponse {
    /** The embeddings for each request, in the same order as provided in
     the batch request.
     */
    embeddings?: ContentEmbedding[];
    /** Vertex API only. Metadata about the request.
     */
    metadata?: EmbedContentMetadata;
}

/** Represents a customer-managed encryption key spec that can be applied to a top-level resource. */
export declare interface EncryptionSpec {
    /** Required. The Cloud KMS resource identifier of the customer managed encryption key used to protect a resource. Has the form: `projects/my-project/locations/my-region/keyRings/my-kr/cryptoKeys/my-key`. The key needs to be in the same region as where the compute resource is created. */
    kmsKeyName?: string;
}

/** An endpoint where you deploy models. */
export declare interface Endpoint {
    /** Resource name of the endpoint. */
    name?: string;
    /** ID of the model that's deployed to the endpoint. */
    deployedModelId?: string;
}

/** End of speech sensitivity. */
export declare enum EndSensitivity {
    END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED",
    END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH",
    END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW"
}

/** Tool to search public web data, powered by Vertex AI Search and Sec4 compliance. */
export declare interface EnterpriseWebSearch {
}

/** Code generated by the model that is meant to be executed, and the result returned to the model. Generated when using the [FunctionDeclaration] tool and [FunctionCallingConfig] mode is set to [Mode.CODE]. */
export declare interface ExecutableCode {
    /** Required. The code to be executed. */
    code?: string;
    /** Required. Programming language of the `code`. */
    language?: Language;
}

/** Options for feature selection preference. */
export declare enum FeatureSelectionPreference {
    FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED",
    PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY",
    BALANCED = "BALANCED",
    PRIORITIZE_COST = "PRIORITIZE_COST"
}

export declare interface FetchPredictOperationConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters for the fetchPredictOperation method. */
export declare interface FetchPredictOperationParameters {
    /** The server-assigned name for the operation. */
    operationName: string;
    resourceName: string;
    /** Used to override the default configuration. */
    config?: FetchPredictOperationConfig;
}

/** A file uploaded to the API. */
declare interface File_2 {
    /** The `File` resource name. The ID (name excluding the "files/" prefix) can contain up to 40 characters that are lowercase alphanumeric or dashes (-). The ID cannot start or end with a dash. If the name is empty on create, a unique name will be generated. Example: `files/123-456` */
    name?: string;
    /** Optional. The human-readable display name for the `File`. The display name must be no more than 512 characters in length, including spaces. Example: 'Welcome Image' */
    displayName?: string;
    /** Output only. MIME type of the file. */
    mimeType?: string;
    /** Output only. Size of the file in bytes. */
    sizeBytes?: string;
    /** Output only. The timestamp of when the `File` was created. */
    createTime?: string;
    /** Output only. The timestamp of when the `File` will be deleted. Only set if the `File` is scheduled to expire. */
    expirationTime?: string;
    /** Output only. The timestamp of when the `File` was last updated. */
    updateTime?: string;
    /** Output only. SHA-256 hash of the uploaded bytes. The hash value is encoded in base64 format. */
    sha256Hash?: string;
    /** Output only. The URI of the `File`. */
    uri?: string;
    /** Output only. The URI of the `File`, only set for downloadable (generated) files. */
    downloadUri?: string;
    /** Output only. Processing state of the File. */
    state?: FileState;
    /** Output only. The source of the `File`. */
    source?: FileSource;
    /** Output only. Metadata for a video. */
    videoMetadata?: Record<string, unknown>;
    /** Output only. Error status if File processing failed. */
    error?: FileStatus;
}
export { File_2 as File }

/** URI based data. */
export declare interface FileData {
    /** Required. URI. */
    fileUri?: string;
    /** Required. The IANA standard MIME type of the source data. */
    mimeType?: string;
}

export declare class Files extends BaseModule {
    private readonly apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Lists all current project files from the service.
     *
     * @param params - The parameters for the list request
     * @return The paginated results of the list of files
     *
     * @example
     * The following code prints the names of all files from the service, the
     * size of each page is 10.
     *
     * ```ts
     * const listResponse = await ai.files.list({config: {'pageSize': 10}});
     * for await (const file of listResponse) {
     *   console.log(file.name);
     * }
     * ```
     */
    list: (params?: types.ListFilesParameters) => Promise<Pager<types.File>>;
    /**
     * Uploads a file asynchronously to the Gemini API.
     * This method is not available in Vertex AI.
     * Supported upload sources:
     * - Node.js: File path (string) or Blob object.
     * - Browser: Blob object (e.g., File).
     *
     * @remarks
     * The `mimeType` can be specified in the `config` parameter. If omitted:
     *  - For file path (string) inputs, the `mimeType` will be inferred from the
     *     file extension.
     *  - For Blob object inputs, the `mimeType` will be set to the Blob's `type`
     *     property.
     * Somex eamples for file extension to mimeType mapping:
     * .txt -> text/plain
     * .json -> application/json
     * .jpg  -> image/jpeg
     * .png -> image/png
     * .mp3 -> audio/mpeg
     * .mp4 -> video/mp4
     *
     * This section can contain multiple paragraphs and code examples.
     *
     * @param params - Optional parameters specified in the
     *        `types.UploadFileParameters` interface.
     *         @see {@link types.UploadFileParameters#config} for the optional
     *         config in the parameters.
     * @return A promise that resolves to a `types.File` object.
     * @throws An error if called on a Vertex AI client.
     * @throws An error if the `mimeType` is not provided and can not be inferred,
     * the `mimeType` can be provided in the `params.config` parameter.
     * @throws An error occurs if a suitable upload location cannot be established.
     *
     * @example
     * The following code uploads a file to Gemini API.
     *
     * ```ts
     * const file = await ai.files.upload({file: 'file.txt', config: {
     *   mimeType: 'text/plain',
     * }});
     * console.log(file.name);
     * ```
     */
    upload(params: types.UploadFileParameters): Promise<types.File>;
    /**
     * Downloads a remotely stored file asynchronously to a location specified in
     * the `params` object. This method only works on Node environment, to
     * download files in the browser, use a browser compliant method like an <a>
     * tag.
     *
     * @param params - The parameters for the download request.
     *
     * @example
     * The following code downloads an example file named "files/mehozpxf877d" as
     * "file.txt".
     *
     * ```ts
     * await ai.files.download({file: file.name, downloadPath: 'file.txt'});
     * ```
     */
    download(params: types.DownloadFileParameters): Promise<void>;
    private listInternal;
    private createInternal;
    /**
     * Retrieves the file information from the service.
     *
     * @param params - The parameters for the get request
     * @return The Promise that resolves to the types.File object requested.
     *
     * @example
     * ```ts
     * const config: GetFileParameters = {
     *   name: fileName,
     * };
     * file = await ai.files.get(config);
     * console.log(file.name);
     * ```
     */
    get(params: types.GetFileParameters): Promise<types.File>;
    /**
     * Deletes a remotely stored file.
     *
     * @param params - The parameters for the delete request.
     * @return The DeleteFileResponse, the response for the delete method.
     *
     * @example
     * The following code deletes an example file named "files/mehozpxf877d".
     *
     * ```ts
     * await ai.files.delete({name: file.name});
     * ```
     */
    delete(params: types.DeleteFileParameters): Promise<types.DeleteFileResponse>;
}

/** Source of the File. */
export declare enum FileSource {
    SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED",
    UPLOADED = "UPLOADED",
    GENERATED = "GENERATED"
}

/**
 * Represents the size and mimeType of a file. The information is used to
 * request the upload URL from the https://generativelanguage.googleapis.com/upload/v1beta/files endpoint.
 * This interface defines the structure for constructing and executing HTTP
 * requests.
 */
declare interface FileStat {
    /**
     * The size of the file in bytes.
     */
    size: number;
    /**
     * The MIME type of the file.
     */
    type: string | undefined;
}

/** State for the lifecycle of a File. */
export declare enum FileState {
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED",
    PROCESSING = "PROCESSING",
    ACTIVE = "ACTIVE",
    FAILED = "FAILED"
}

/** Status of a File that uses a common error model. */
export declare interface FileStatus {
    /** A list of messages that carry the error details. There is a common set of message types for APIs to use. */
    details?: Record<string, unknown>[];
    /** A list of messages that carry the error details. There is a common set of message types for APIs to use. */
    message?: string;
    /** The status code. 0 for OK, 1 for CANCELLED */
    code?: number;
}

/** Output only. The reason why the model stopped generating tokens.

 If empty, the model has not stopped generating the tokens.
 */
export declare enum FinishReason {
    FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED",
    STOP = "STOP",
    MAX_TOKENS = "MAX_TOKENS",
    SAFETY = "SAFETY",
    RECITATION = "RECITATION",
    LANGUAGE = "LANGUAGE",
    OTHER = "OTHER",
    BLOCKLIST = "BLOCKLIST",
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT",
    SPII = "SPII",
    MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL",
    IMAGE_SAFETY = "IMAGE_SAFETY"
}

/** A function call. */
export declare interface FunctionCall {
    /** The unique id of the function call. If populated, the client to execute the
     `function_call` and return the response with the matching `id`. */
    id?: string;
    /** Optional. Required. The function parameters and values in JSON object format. See [FunctionDeclaration.parameters] for parameter details. */
    args?: Record<string, unknown>;
    /** Required. The name of the function to call. Matches [FunctionDeclaration.name]. */
    name?: string;
}

/** Function calling config. */
export declare interface FunctionCallingConfig {
    /** Optional. Function calling mode. */
    mode?: FunctionCallingConfigMode;
    /** Optional. Function names to call. Only set when the Mode is ANY. Function names should match [FunctionDeclaration.name]. With mode set to ANY, model will predict a function call from the set of function names provided. */
    allowedFunctionNames?: string[];
}

/** Config for the function calling config mode. */
export declare enum FunctionCallingConfigMode {
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED",
    AUTO = "AUTO",
    ANY = "ANY",
    NONE = "NONE"
}

/** Structured representation of a function declaration as defined by the [OpenAPI 3.0 specification](https://spec.openapis.org/oas/v3.0.3). Included in this declaration are the function name, description, parameters and response type. This FunctionDeclaration is a representation of a block of code that can be used as a `Tool` by the model and executed by the client. */
export declare interface FunctionDeclaration {
    /** Optional. Description and purpose of the function. Model uses it to decide how and whether to call the function. */
    description?: string;
    /** Required. The name of the function to call. Must start with a letter or an underscore. Must be a-z, A-Z, 0-9, or contain underscores, dots and dashes, with a maximum length of 64. */
    name?: string;
    /** Optional. Describes the parameters to this function in JSON Schema Object format. Reflects the Open API 3.03 Parameter Object. string Key: the name of the parameter. Parameter names are case sensitive. Schema Value: the Schema defining the type used for the parameter. For function with no parameters, this can be left unset. Parameter names must start with a letter or an underscore and must only contain chars a-z, A-Z, 0-9, or underscores with a maximum length of 64. Example with 1 required and 1 optional parameter: type: OBJECT properties: param1: type: STRING param2: type: INTEGER required: - param1 */
    parameters?: Schema;
    /** Optional. Describes the output from this function in JSON Schema format. Reflects the Open API 3.03 Response Object. The Schema defines the type used for the response value of the function. */
    response?: Schema;
}

/** A function response. */
export declare class FunctionResponse {
    /** The id of the function call this response is for. Populated by the client
     to match the corresponding function call `id`. */
    id?: string;
    /** Required. The name of the function to call. Matches [FunctionDeclaration.name] and [FunctionCall.name]. */
    name?: string;
    /** Required. The function response in JSON object format. Use "output" key to specify function output and "error" key to specify error details (if any). If "output" and "error" keys are not specified, then whole "response" is treated as function output. */
    response?: Record<string, unknown>;
}

/** Optional model configuration parameters.

 For more information, see `Content generation parameters
 <https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters>`_.
 */
export declare interface GenerateContentConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** Instructions for the model to steer it toward better performance.
     For example, "Answer as concisely as possible" or "Don't use technical
     terms in your response".
     */
    systemInstruction?: ContentUnion;
    /** Value that controls the degree of randomness in token selection.
     Lower temperatures are good for prompts that require a less open-ended or
     creative response, while higher temperatures can lead to more diverse or
     creative results.
     */
    temperature?: number;
    /** Tokens are selected from the most to least probable until the sum
     of their probabilities equals this value. Use a lower value for less
     random responses and a higher value for more random responses.
     */
    topP?: number;
    /** For each token selection step, the ``top_k`` tokens with the
     highest probabilities are sampled. Then tokens are further filtered based
     on ``top_p`` with the final token selected using temperature sampling. Use
     a lower number for less random responses and a higher number for more
     random responses.
     */
    topK?: number;
    /** Number of response variations to return.
     */
    candidateCount?: number;
    /** Maximum number of tokens that can be generated in the response.
     */
    maxOutputTokens?: number;
    /** List of strings that tells the model to stop generating text if one
     of the strings is encountered in the response.
     */
    stopSequences?: string[];
    /** Whether to return the log probabilities of the tokens that were
     chosen by the model at each step.
     */
    responseLogprobs?: boolean;
    /** Number of top candidate tokens to return the log probabilities for
     at each generation step.
     */
    logprobs?: number;
    /** Positive values penalize tokens that already appear in the
     generated text, increasing the probability of generating more diverse
     content.
     */
    presencePenalty?: number;
    /** Positive values penalize tokens that repeatedly appear in the
     generated text, increasing the probability of generating more diverse
     content.
     */
    frequencyPenalty?: number;
    /** When ``seed`` is fixed to a specific number, the model makes a best
     effort to provide the same response for repeated requests. By default, a
     random number is used.
     */
    seed?: number;
    /** Output response media type of the generated candidate text.
     */
    responseMimeType?: string;
    /** Schema that the generated candidate text must adhere to.
     */
    responseSchema?: SchemaUnion;
    /** Configuration for model router requests.
     */
    routingConfig?: GenerationConfigRoutingConfig;
    /** Configuration for model selection.
     */
    modelSelectionConfig?: ModelSelectionConfig;
    /** Safety settings in the request to block unsafe content in the
     response.
     */
    safetySettings?: SafetySetting[];
    /** Code that enables the system to interact with external systems to
     perform an action outside of the knowledge and scope of the model.
     */
    tools?: ToolListUnion;
    /** Associates model output to a specific function call.
     */
    toolConfig?: ToolConfig;
    /** Labels with user-defined metadata to break down billed charges. */
    labels?: Record<string, string>;
    /** Resource name of a context cache that can be used in subsequent
     requests.
     */
    cachedContent?: string;
    /** The requested modalities of the response. Represents the set of
     modalities that the model can return.
     */
    responseModalities?: string[];
    /** If specified, the media resolution specified will be used.
     */
    mediaResolution?: MediaResolution;
    /** The speech generation configuration.
     */
    speechConfig?: SpeechConfigUnion;
    /** If enabled, audio timestamp will be included in the request to the
     model.
     */
    audioTimestamp?: boolean;
    /** The thinking features configuration.
     */
    thinkingConfig?: ThinkingConfig;
}

/** Config for models.generate_content parameters. */
export declare interface GenerateContentParameters {
    /** ID of the model to use. For a list of models, see `Google models
     <https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models>`_. */
    model: string;
    /** Content of the request.
     */
    contents: ContentListUnion;
    /** Configuration that contains optional model parameters.
     */
    config?: GenerateContentConfig;
}

/** Response message for PredictionService.GenerateContent. */
export declare class GenerateContentResponse {
    /** Response variations returned by the model.
     */
    candidates?: Candidate[];
    /** Timestamp when the request is made to the server.
     */
    createTime?: string;
    /** Identifier for each response.
     */
    responseId?: string;
    /** Output only. The model version used to generate the response. */
    modelVersion?: string;
    /** Output only. Content filter results for a prompt sent in the request. Note: Sent only in the first stream chunk. Only happens when no candidates were generated due to content violations. */
    promptFeedback?: GenerateContentResponsePromptFeedback;
    /** Usage metadata about the response(s). */
    usageMetadata?: GenerateContentResponseUsageMetadata;
    /**
     * Returns the concatenation of all text parts from the first candidate in the response.
     *
     * @remarks
     * If there are multiple candidates in the response, the text from the first
     * one will be returned.
     * If there are non-text parts in the response, the concatenation of all text
     * parts will be returned, and a warning will be logged.
     * If there are thought parts in the response, the concatenation of all text
     * parts excluding the thought parts will be returned.
     *
     * @example
     * ```ts
     * const response = await ai.models.generateContent({
     *   model: 'gemini-2.0-flash',
     *   contents:
     *     'Why is the sky blue?',
     * });
     *
     * console.debug(response.text);
     * ```
     */
    get text(): string | undefined;
    /**
     * Returns the concatenation of all inline data parts from the first candidate
     * in the response.
     *
     * @remarks
     * If there are multiple candidates in the response, the inline data from the
     * first one will be returned. If there are non-inline data parts in the
     * response, the concatenation of all inline data parts will be returned, and
     * a warning will be logged.
     */
    get data(): string | undefined;
    /**
     * Returns the function calls from the first candidate in the response.
     *
     * @remarks
     * If there are multiple candidates in the response, the function calls from
     * the first one will be returned.
     * If there are no function calls in the response, undefined will be returned.
     *
     * @example
     * ```ts
     * const controlLightFunctionDeclaration: FunctionDeclaration = {
     *   name: 'controlLight',
     *   parameters: {
     *   type: Type.OBJECT,
     *   description: 'Set the brightness and color temperature of a room light.',
     *   properties: {
     *     brightness: {
     *       type: Type.NUMBER,
     *       description:
     *         'Light level from 0 to 100. Zero is off and 100 is full brightness.',
     *     },
     *     colorTemperature: {
     *       type: Type.STRING,
     *       description:
     *         'Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.',
     *     },
     *   },
     *   required: ['brightness', 'colorTemperature'],
     *  };
     *  const response = await ai.models.generateContent({
     *     model: 'gemini-2.0-flash',
     *     contents: 'Dim the lights so the room feels cozy and warm.',
     *     config: {
     *       tools: [{functionDeclarations: [controlLightFunctionDeclaration]}],
     *       toolConfig: {
     *         functionCallingConfig: {
     *           mode: FunctionCallingConfigMode.ANY,
     *           allowedFunctionNames: ['controlLight'],
     *         },
     *       },
     *     },
     *   });
     *  console.debug(JSON.stringify(response.functionCalls));
     * ```
     */
    get functionCalls(): FunctionCall[] | undefined;
    /**
     * Returns the first executable code from the first candidate in the response.
     *
     * @remarks
     * If there are multiple candidates in the response, the executable code from
     * the first one will be returned.
     * If there are no executable code in the response, undefined will be
     * returned.
     *
     * @example
     * ```ts
     * const response = await ai.models.generateContent({
     *   model: 'gemini-2.0-flash',
     *   contents:
     *     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
     *   config: {
     *     tools: [{codeExecution: {}}],
     *   },
     * });
     *
     * console.debug(response.executableCode);
     * ```
     */
    get executableCode(): string | undefined;
    /**
     * Returns the first code execution result from the first candidate in the response.
     *
     * @remarks
     * If there are multiple candidates in the response, the code execution result from
     * the first one will be returned.
     * If there are no code execution result in the response, undefined will be returned.
     *
     * @example
     * ```ts
     * const response = await ai.models.generateContent({
     *   model: 'gemini-2.0-flash',
     *   contents:
     *     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
     *   config: {
     *     tools: [{codeExecution: {}}],
     *   },
     * });
     *
     * console.debug(response.codeExecutionResult);
     * ```
     */
    get codeExecutionResult(): string | undefined;
}

/** Content filter results for a prompt sent in the request. */
export declare class GenerateContentResponsePromptFeedback {
    /** Output only. Blocked reason. */
    blockReason?: BlockedReason;
    /** Output only. A readable block reason message. */
    blockReasonMessage?: string;
    /** Output only. Safety ratings. */
    safetyRatings?: SafetyRating[];
}

/** Usage metadata about response(s). */
export declare class GenerateContentResponseUsageMetadata {
    /** Output only. List of modalities of the cached content in the request input. */
    cacheTokensDetails?: ModalityTokenCount[];
    /** Output only. Number of tokens in the cached part in the input (the cached content). */
    cachedContentTokenCount?: number;
    /** Number of tokens in the response(s). */
    candidatesTokenCount?: number;
    /** Output only. List of modalities that were returned in the response. */
    candidatesTokensDetails?: ModalityTokenCount[];
    /** Number of tokens in the request. When `cached_content` is set, this is still the total effective prompt size meaning this includes the number of tokens in the cached content. */
    promptTokenCount?: number;
    /** Output only. List of modalities that were processed in the request input. */
    promptTokensDetails?: ModalityTokenCount[];
    /** Output only. Number of tokens present in thoughts output. */
    thoughtsTokenCount?: number;
    /** Output only. Number of tokens present in tool-use prompt(s). */
    toolUsePromptTokenCount?: number;
    /** Output only. List of modalities that were processed for tool-use request inputs. */
    toolUsePromptTokensDetails?: ModalityTokenCount[];
    /** Total token count for prompt, response candidates, and tool-use prompts (if present). */
    totalTokenCount?: number;
    /** Output only. Traffic type. This shows whether a request consumes Pay-As-You-Go or Provisioned Throughput quota. */
    trafficType?: TrafficType;
}

/** An output image. */
export declare interface GeneratedImage {
    /** The output image data.
     */
    image?: Image_2;
    /** Responsible AI filter reason if the image is filtered out of the
     response.
     */
    raiFilteredReason?: string;
    /** Safety attributes of the image. Lists of RAI categories and their
     scores of each content.
     */
    safetyAttributes?: SafetyAttributes;
    /** The rewritten prompt used for the image generation if the prompt
     enhancer is enabled.
     */
    enhancedPrompt?: string;
}

/** A generated video. */
export declare interface GeneratedVideo {
    /** The output video */
    video?: Video;
}

/** The config for generating an images. */
export declare interface GenerateImagesConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** Cloud Storage URI used to store the generated images.
     */
    outputGcsUri?: string;
    /** Description of what to discourage in the generated images.
     */
    negativePrompt?: string;
    /** Number of images to generate.
     */
    numberOfImages?: number;
    /** Aspect ratio of the generated images.
     */
    aspectRatio?: string;
    /** Controls how much the model adheres to the text prompt. Large
     values increase output and prompt alignment, but may compromise image
     quality.
     */
    guidanceScale?: number;
    /** Random seed for image generation. This is not available when
     ``add_watermark`` is set to true.
     */
    seed?: number;
    /** Filter level for safety filtering.
     */
    safetyFilterLevel?: SafetyFilterLevel;
    /** Allows generation of people by the model.
     */
    personGeneration?: PersonGeneration;
    /** Whether to report the safety scores of each generated image and
     the positive prompt in the response.
     */
    includeSafetyAttributes?: boolean;
    /** Whether to include the Responsible AI filter reason if the image
     is filtered out of the response.
     */
    includeRaiReason?: boolean;
    /** Language of the text in the prompt.
     */
    language?: ImagePromptLanguage;
    /** MIME type of the generated image.
     */
    outputMimeType?: string;
    /** Compression quality of the generated image (for ``image/jpeg``
     only).
     */
    outputCompressionQuality?: number;
    /** Whether to add a watermark to the generated images.
     */
    addWatermark?: boolean;
    /** Whether to use the prompt rewriting logic.
     */
    enhancePrompt?: boolean;
}

/** The parameters for generating images. */
export declare interface GenerateImagesParameters {
    /** ID of the model to use. For a list of models, see `Google models
     <https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models>`_. */
    model: string;
    /** Text prompt that typically describes the images to output.
     */
    prompt: string;
    /** Configuration for generating images.
     */
    config?: GenerateImagesConfig;
}

/** The output images response. */
export declare class GenerateImagesResponse {
    /** List of generated images.
     */
    generatedImages?: GeneratedImage[];
    /** Safety attributes of the positive prompt. Only populated if
     ``include_safety_attributes`` is set to True.
     */
    positivePromptSafetyAttributes?: SafetyAttributes;
}

/** Configuration for generating videos. */
export declare interface GenerateVideosConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** Number of output videos. */
    numberOfVideos?: number;
    /** The gcs bucket where to save the generated videos. */
    outputGcsUri?: string;
    /** Frames per second for video generation. */
    fps?: number;
    /** Duration of the clip for video generation in seconds. */
    durationSeconds?: number;
    /** The RNG seed. If RNG seed is exactly same for each request with unchanged inputs, the prediction results will be consistent. Otherwise, a random RNG seed will be used each time to produce a different result. */
    seed?: number;
    /** The aspect ratio for the generated video. 16:9 (landscape) and 9:16 (portrait) are supported. */
    aspectRatio?: string;
    /** The resolution for the generated video. 1280x720, 1920x1080 are supported. */
    resolution?: string;
    /** Whether allow to generate person videos, and restrict to specific ages. Supported values are: dont_allow, allow_adult. */
    personGeneration?: string;
    /** The pubsub topic where to publish the video generation progress. */
    pubsubTopic?: string;
    /** Optional field in addition to the text content. Negative prompts can be explicitly stated here to help generate the video. */
    negativePrompt?: string;
    /** Whether to use the prompt rewriting logic. */
    enhancePrompt?: boolean;
}

/** A video generation operation. */
export declare interface GenerateVideosOperation {
    /** The server-assigned name, which is only unique within the same service that originally returns it. If you use the default HTTP mapping, the `name` should be a resource name ending with `operations/{unique_id}`. */
    name?: string;
    /** Service-specific metadata associated with the operation. It typically contains progress information and common metadata such as create time. Some services might not provide such metadata.  Any method that returns a long-running operation should document the metadata type, if any. */
    metadata?: Record<string, unknown>;
    /** If the value is `false`, it means the operation is still in progress. If `true`, the operation is completed, and either `error` or `response` is available. */
    done?: boolean;
    /** The error result of the operation in case of failure or cancellation. */
    error?: Record<string, unknown>;
    /** The generated videos. */
    response?: GenerateVideosResponse;
}

/** Class that represents the parameters for generating an image. */
export declare interface GenerateVideosParameters {
    /** ID of the model to use. For a list of models, see `Google models
     <https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models>`_. */
    model: string;
    /** The text prompt for generating the videos. Optional for image to video use cases. */
    prompt?: string;
    /** The input image for generating the videos.
     Optional if prompt is provided. */
    image?: Image_2;
    /** Configuration for generating videos. */
    config?: GenerateVideosConfig;
}

/** Response with generated videos. */
export declare class GenerateVideosResponse {
    /** List of the generated videos */
    generatedVideos?: GeneratedVideo[];
    /** Returns if any videos were filtered due to RAI policies. */
    raiMediaFilteredCount?: number;
    /** Returns rai failure reasons if any. */
    raiMediaFilteredReasons?: string[];
}

/** Generation config. */
export declare interface GenerationConfig {
    /** Optional. If enabled, audio timestamp will be included in the request to the model. */
    audioTimestamp?: boolean;
    /** Optional. Number of candidates to generate. */
    candidateCount?: number;
    /** Optional. Frequency penalties. */
    frequencyPenalty?: number;
    /** Optional. Logit probabilities. */
    logprobs?: number;
    /** Optional. The maximum number of output tokens to generate per message. */
    maxOutputTokens?: number;
    /** Optional. If specified, the media resolution specified will be used. */
    mediaResolution?: MediaResolution;
    /** Optional. Positive penalties. */
    presencePenalty?: number;
    /** Optional. If true, export the logprobs results in response. */
    responseLogprobs?: boolean;
    /** Optional. Output response mimetype of the generated candidate text. Supported mimetype: - `text/plain`: (default) Text output. - `application/json`: JSON response in the candidates. The model needs to be prompted to output the appropriate response type, otherwise the behavior is undefined. This is a preview feature. */
    responseMimeType?: string;
    /** Optional. The `Schema` object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. Represents a select subset of an [OpenAPI 3.0 schema object](https://spec.openapis.org/oas/v3.0.3#schema). If set, a compatible response_mime_type must also be set. Compatible mimetypes: `application/json`: Schema for JSON response. */
    responseSchema?: Schema;
    /** Optional. Routing configuration. */
    routingConfig?: GenerationConfigRoutingConfig;
    /** Optional. Seed. */
    seed?: number;
    /** Optional. Stop sequences. */
    stopSequences?: string[];
    /** Optional. Controls the randomness of predictions. */
    temperature?: number;
    /** Optional. If specified, top-k sampling will be used. */
    topK?: number;
    /** Optional. If specified, nucleus sampling will be used. */
    topP?: number;
}

/** The configuration for routing the request to a specific model. */
export declare interface GenerationConfigRoutingConfig {
    /** Automated routing. */
    autoMode?: GenerationConfigRoutingConfigAutoRoutingMode;
    /** Manual routing. */
    manualMode?: GenerationConfigRoutingConfigManualRoutingMode;
}

/** When automated routing is specified, the routing will be determined by the pretrained routing model and customer provided model routing preference. */
export declare interface GenerationConfigRoutingConfigAutoRoutingMode {
    /** The model routing preference. */
    modelRoutingPreference?: 'UNKNOWN' | 'PRIORITIZE_QUALITY' | 'BALANCED' | 'PRIORITIZE_COST';
}

/** When manual routing is set, the specified model will be used directly. */
export declare interface GenerationConfigRoutingConfigManualRoutingMode {
    /** The model name to use. Only the public LLM models are accepted. e.g. 'gemini-1.5-pro-001'. */
    modelName?: string;
}

/** Optional parameters for caches.get method. */
export declare interface GetCachedContentConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters for caches.get method. */
export declare interface GetCachedContentParameters {
    /** The server-generated resource name of the cached content.
     */
    name: string;
    /** Optional parameters for the request.
     */
    config?: GetCachedContentConfig;
}

/** Used to override the default configuration. */
export declare interface GetFileConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Generates the parameters for the get method. */
export declare interface GetFileParameters {
    /** The name identifier for the file to retrieve. */
    name: string;
    /** Used to override the default configuration. */
    config?: GetFileConfig;
}

/** Optional parameters for models.get method. */
export declare interface GetModelConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

export declare interface GetModelParameters {
    model: string;
    /** Optional parameters for the request. */
    config?: GetModelConfig;
}

export declare interface GetOperationConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters for the GET method. */
export declare interface GetOperationParameters {
    /** The server-assigned name for the operation. */
    operationName: string;
    /** Used to override the default configuration. */
    config?: GetOperationConfig;
}

/** Optional parameters for tunings.get method. */
export declare interface GetTuningJobConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
}

/** Parameters for the get method. */
export declare interface GetTuningJobParameters {
    name: string;
    /** Optional parameters for the request. */
    config?: GetTuningJobConfig;
}

/**
 * The Google GenAI SDK.
 *
 * @remarks
 * Provides access to the GenAI features through either the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Gemini API}
 * or the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Vertex AI API}.
 *
 * The {@link GoogleGenAIOptions.vertexai} value determines which of the API services to use.
 *
 * When using the Gemini API, a {@link GoogleGenAIOptions.apiKey} must also be set,
 * when using Vertex AI {@link GoogleGenAIOptions.project} and {@link GoogleGenAIOptions.location} must also be set.
 *
 * @example
 * Initializing the SDK for using the Gemini API:
 * ```ts
 * import {GoogleGenAI} from '@google/genai';
 * const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
 * ```
 *
 * @example
 * Initializing the SDK for using the Vertex AI API:
 * ```ts
 * import {GoogleGenAI} from '@google/genai';
 * const ai = new GoogleGenAI({
 *   vertexai: true,
 *   project: 'PROJECT_ID',
 *   location: 'PROJECT_LOCATION'
 * });
 * ```
 *
 */
export declare class GoogleGenAI {
    protected readonly apiClient: ApiClient;
    private readonly apiKey?;
    readonly vertexai: boolean;
    private readonly apiVersion?;
    readonly models: Models;
    readonly live: Live;
    readonly chats: Chats;
    readonly caches: Caches;
    readonly files: Files;
    readonly operations: Operations;
    readonly tunings: Tunings;
    constructor(options: GoogleGenAIOptions);
}

/**
 * Google Gen AI SDK's configuration options.
 *
 * See {@link GoogleGenAI} for usage samples.
 */
export declare interface GoogleGenAIOptions {
    /**
     * Optional. Determines whether to use the Vertex AI or the Gemini API.
     *
     * @remarks
     * When true, the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Vertex AI API} will used.
     * When false, the {@link https://ai.google.dev/api | Gemini API} will be used.
     *
     * If unset, default SDK behavior is to use the Gemini API service.
     */
    vertexai?: boolean;
    /**
     * Optional. The Google Cloud project ID for Vertex AI clients.
     *
     * Find your project ID: https://cloud.google.com/resource-manager/docs/creating-managing-projects#identifying_projects
     *
     * @remarks
     * Only supported on Node runtimes, ignored on browser runtimes.
     */
    project?: string;
    /**
     * Optional. The Google Cloud project {@link https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations | location} for Vertex AI clients.
     *
     * @remarks
     * Only supported on Node runtimes, ignored on browser runtimes.
     *
     */
    location?: string;
    /**
     * The API Key, required for Gemini API clients.
     *
     * @remarks
     * Required on browser runtimes.
     */
    apiKey?: string;
    /**
     * Optional. The API version to use.
     *
     * @remarks
     * If unset, the default API version will be used.
     */
    apiVersion?: string;
    /**
     * Optional. Authentication options defined by the by google-auth-library for Vertex AI clients.
     *
     * @remarks
     * @see {@link https://github.com/googleapis/google-auth-library-nodejs/blob/v9.15.0/src/auth/googleauth.ts | GoogleAuthOptions interface in google-auth-library-nodejs}.
     *
     * Only supported on Node runtimes, ignored on browser runtimes.
     *
     */
    googleAuthOptions?: GoogleAuthOptions;
    /**
     * Optional. A set of customizable configuration for HTTP requests.
     */
    httpOptions?: HttpOptions;
}

/** Tool to support Google Maps in Model. */
export declare interface GoogleMaps {
    /** Optional. Auth config for the Google Maps tool. */
    authConfig?: AuthConfig;
}

/** The `Status` type defines a logical error model that is suitable for different programming environments, including REST APIs and RPC APIs. It is used by [gRPC](https://github.com/grpc). Each `Status` message contains three pieces of data: error code, error message, and error details. You can find out more about this error model and how to work with it in the [API Design Guide](https://cloud.google.com/apis/design/errors). */
export declare interface GoogleRpcStatus {
    /** The status code, which should be an enum value of google.rpc.Code. */
    code?: number;
    /** A list of messages that carry the error details. There is a common set of message types for APIs to use. */
    details?: Record<string, unknown>[];
    /** A developer-facing error message, which should be in English. Any user-facing error message should be localized and sent in the google.rpc.Status.details field, or localized by the client. */
    message?: string;
}

/** Tool to support Google Search in Model. Powered by Google. */
export declare interface GoogleSearch {
}

/** Tool to retrieve public web data for grounding, powered by Google. */
export declare interface GoogleSearchRetrieval {
    /** Specifies the dynamic retrieval configuration for the given source. */
    dynamicRetrievalConfig?: DynamicRetrievalConfig;
}

/** Represents a whole or partial calendar date, such as a birthday. The time of day and time zone are either specified elsewhere or are insignificant. The date is relative to the Gregorian Calendar. This can represent one of the following: * A full date, with non-zero year, month, and day values. * A month and day, with a zero year (for example, an anniversary). * A year on its own, with a zero month and a zero day. * A year and month, with a zero day (for example, a credit card expiration date). Related types: * google.type.TimeOfDay * google.type.DateTime * google.protobuf.Timestamp */
export declare interface GoogleTypeDate {
    /** Day of a month. Must be from 1 to 31 and valid for the year and month, or 0 to specify a year by itself or a year and month where the day isn't significant. */
    day?: number;
    /** Month of a year. Must be from 1 to 12, or 0 to specify a year without a month and day. */
    month?: number;
    /** Year of the date. Must be from 1 to 9999, or 0 to specify a date without a year. */
    year?: number;
}

/** Grounding chunk. */
export declare interface GroundingChunk {
    /** Grounding chunk from context retrieved by the retrieval tools. */
    retrievedContext?: GroundingChunkRetrievedContext;
    /** Grounding chunk from the web. */
    web?: GroundingChunkWeb;
}

/** Chunk from context retrieved by the retrieval tools. */
export declare interface GroundingChunkRetrievedContext {
    /** Text of the attribution. */
    text?: string;
    /** Title of the attribution. */
    title?: string;
    /** URI reference of the attribution. */
    uri?: string;
}

/** Chunk from the web. */
export declare interface GroundingChunkWeb {
    /** Domain of the (original) URI. */
    domain?: string;
    /** Title of the chunk. */
    title?: string;
    /** URI reference of the chunk. */
    uri?: string;
}

/** Metadata returned to client when grounding is enabled. */
export declare interface GroundingMetadata {
    /** List of supporting references retrieved from specified grounding source. */
    groundingChunks?: GroundingChunk[];
    /** Optional. List of grounding support. */
    groundingSupports?: GroundingSupport[];
    /** Optional. Output only. Retrieval metadata. */
    retrievalMetadata?: RetrievalMetadata;
    /** Optional. Queries executed by the retrieval tools. */
    retrievalQueries?: string[];
    /** Optional. Google search entry for the following-up web searches. */
    searchEntryPoint?: SearchEntryPoint;
    /** Optional. Web search queries for the following-up web search. */
    webSearchQueries?: string[];
}

/** Grounding support. */
export declare interface GroundingSupport {
    /** Confidence score of the support references. Ranges from 0 to 1. 1 is the most confident. This list must have the same size as the grounding_chunk_indices. */
    confidenceScores?: number[];
    /** A list of indices (into 'grounding_chunk') specifying the citations associated with the claim. For instance [1,3,4] means that grounding_chunk[1], grounding_chunk[3], grounding_chunk[4] are the retrieved content attributed to the claim. */
    groundingChunkIndices?: number[];
    /** Segment of the content this support belongs to. */
    segment?: Segment;
}

/** Optional. Specify if the threshold is used for probability or severity score. If not specified, the threshold is used for probability score. */
export declare enum HarmBlockMethod {
    HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED",
    SEVERITY = "SEVERITY",
    PROBABILITY = "PROBABILITY"
}

/** Required. The harm block threshold. */
export declare enum HarmBlockThreshold {
    HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
    BLOCK_NONE = "BLOCK_NONE",
    OFF = "OFF"
}

/** Required. Harm category. */
export declare enum HarmCategory {
    HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED",
    HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH",
    HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT",
    HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT",
    HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY"
}

/** Output only. Harm probability levels in the content. */
export declare enum HarmProbability {
    HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED",
    NEGLIGIBLE = "NEGLIGIBLE",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

/** Output only. Harm severity levels in the content. */
export declare enum HarmSeverity {
    HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED",
    HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE",
    HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW",
    HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM",
    HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH"
}

/** HTTP options to be used in each of the requests. */
export declare interface HttpOptions {
    /** The base URL for the AI platform service endpoint. */
    baseUrl?: string;
    /** Specifies the version of the API to use. */
    apiVersion?: string;
    /** Additional HTTP headers to be sent with the request. */
    headers?: Record<string, string>;
    /** Timeout for the request in milliseconds. */
    timeout?: number;
}

/**
 * Represents the necessary information to send a request to an API endpoint.
 * This interface defines the structure for constructing and executing HTTP
 * requests.
 */
declare interface HttpRequest {
    /**
     * URL path from the modules, this path is appended to the base API URL to
     * form the complete request URL.
     *
     * If you wish to set full URL, use httpOptions.baseUrl instead. Example to
     * set full URL in the request:
     *
     * const request: HttpRequest = {
     *   path: '',
     *   httpOptions: {
     *     baseUrl: 'https://<custom-full-url>',
     *     apiVersion: '',
     *   },
     *   httpMethod: 'GET',
     * };
     *
     * The result URL will be: https://<custom-full-url>
     *
     */
    path: string;
    /**
     * Optional query parameters to be appended to the request URL.
     */
    queryParams?: Record<string, string>;
    /**
     * Optional request body in json string or Blob format, GET request doesn't
     * need a request body.
     */
    body?: string | Blob;
    /**
     * The HTTP method to be used for the request.
     */
    httpMethod: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    /**
     * Optional set of customizable configuration for HTTP requests.
     */
    httpOptions?: HttpOptions;
    /**
     * Optional abort signal which can be used to cancel the request.
     */
    abortSignal?: AbortSignal;
}

/** A wrapper class for the http response. */
export declare class HttpResponse {
    /** Used to retain the processed HTTP headers in the response. */
    headers?: Record<string, string>;
    /**
     * The original http response.
     */
    responseInternal: Response;
    constructor(response: Response);
    json(): Promise<unknown>;
}

/** An image. */
declare interface Image_2 {
    /** The Cloud Storage URI of the image. ``Image`` can contain a value
     for this field or the ``image_bytes`` field but not both.
     */
    gcsUri?: string;
    /** The image bytes data. ``Image`` can contain a value for this field
     or the ``gcs_uri`` field but not both.
     */
    imageBytes?: string;
    /** The MIME type of the image. */
    mimeType?: string;
}
export { Image_2 as Image }

/** Enum that specifies the language of the text in the prompt. */
export declare enum ImagePromptLanguage {
    auto = "auto",
    en = "en",
    ja = "ja",
    ko = "ko",
    hi = "hi"
}

/** Output only. The detailed state of the job. */
export declare enum JobState {
    JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED",
    JOB_STATE_QUEUED = "JOB_STATE_QUEUED",
    JOB_STATE_PENDING = "JOB_STATE_PENDING",
    JOB_STATE_RUNNING = "JOB_STATE_RUNNING",
    JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED",
    JOB_STATE_FAILED = "JOB_STATE_FAILED",
    JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING",
    JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED",
    JOB_STATE_PAUSED = "JOB_STATE_PAUSED",
    JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED",
    JOB_STATE_UPDATING = "JOB_STATE_UPDATING",
    JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED"
}

/** Required. Programming language of the `code`. */
export declare enum Language {
    LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED",
    PYTHON = "PYTHON"
}

/** An object that represents a latitude/longitude pair.

 This is expressed as a pair of doubles to represent degrees latitude and
 degrees longitude. Unless specified otherwise, this object must conform to the
 <a href="https://en.wikipedia.org/wiki/World_Geodetic_System#1984_version">
 WGS84 standard</a>. Values must be within normalized ranges.
 */
export declare interface LatLng {
    /** The latitude in degrees. It must be in the range [-90.0, +90.0]. */
    latitude?: number;
    /** The longitude in degrees. It must be in the range [-180.0, +180.0] */
    longitude?: number;
}

/** Config for caches.list method. */
export declare interface ListCachedContentsConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    pageSize?: number;
    pageToken?: string;
}

/** Parameters for caches.list method. */
export declare interface ListCachedContentsParameters {
    /** Configuration that contains optional parameters.
     */
    config?: ListCachedContentsConfig;
}

export declare class ListCachedContentsResponse {
    nextPageToken?: string;
    /** List of cached contents.
     */
    cachedContents?: CachedContent[];
}

/** Used to override the default configuration. */
export declare interface ListFilesConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    pageSize?: number;
    pageToken?: string;
}

/** Generates the parameters for the list method. */
export declare interface ListFilesParameters {
    /** Used to override the default configuration. */
    config?: ListFilesConfig;
}

/** Response for the list files method. */
export declare class ListFilesResponse {
    /** A token to retrieve next page of results. */
    nextPageToken?: string;
    /** The list of files. */
    files?: File_2[];
}

export declare interface ListModelsConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    pageSize?: number;
    pageToken?: string;
    filter?: string;
    /** Set true to list base models, false to list tuned models. */
    queryBase?: boolean;
}

export declare interface ListModelsParameters {
    config?: ListModelsConfig;
}

export declare class ListModelsResponse {
    nextPageToken?: string;
    models?: Model[];
}

/** Configuration for the list tuning jobs method. */
export declare interface ListTuningJobsConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    pageSize?: number;
    pageToken?: string;
    filter?: string;
}

/** Parameters for the list tuning jobs method. */
export declare interface ListTuningJobsParameters {
    config?: ListTuningJobsConfig;
}

/** Response for the list tuning jobs method. */
export declare class ListTuningJobsResponse {
    /** A token to retrieve the next page of results. Pass to ListTuningJobsRequest.page_token to obtain that page. */
    nextPageToken?: string;
    /** List of TuningJobs in the requested page. */
    tuningJobs?: TuningJob[];
}

/**
 Live class encapsulates the configuration for live interaction with the
 Generative Language API. It embeds ApiClient for general API settings.

 @experimental
 */
export declare class Live {
    private readonly apiClient;
    private readonly auth;
    private readonly webSocketFactory;
    constructor(apiClient: ApiClient, auth: Auth, webSocketFactory: WebSocketFactory);
    /**
     Establishes a connection to the specified model with the given
     configuration and returns a Session object representing that connection.

     @experimental

     @remarks

     @param params - The parameters for establishing a connection to the model.
     @return A live session.

     @example
     ```ts
     let model: string;
     if (GOOGLE_GENAI_USE_VERTEXAI) {
     model = 'gemini-2.0-flash-live-preview-04-09';
     } else {
     model = 'gemini-2.0-flash-live-001';
     }
     const session = await ai.live.connect({
     model: model,
     config: {
     responseModalities: [Modality.AUDIO],
     },
     callbacks: {
     onopen: () => {
     console.log('Connected to the socket.');
     },
     onmessage: (e: MessageEvent) => {
     console.log('Received message from the server: %s\n', debug(e.data));
     },
     onerror: (e: ErrorEvent) => {
     console.log('Error occurred: %s\n', debug(e.error));
     },
     onclose: (e: CloseEvent) => {
     console.log('Connection closed.');
     },
     },
     });
     ```
     */
    connect(params: types.LiveConnectParameters): Promise<Session>;
}

/** Callbacks for the live API. */
export declare interface LiveCallbacks {
    /**
     * Called when the websocket connection is established.
     */
    onopen?: (() => void) | null;
    /**
     * Called when a message is received from the server.
     */
    onmessage: (e: LiveServerMessage) => void;
    /**
     * Called when an error occurs.
     */
    onerror?: ((e: ErrorEvent) => void) | null;
    /**
     * Called when the websocket connection is closed.
     */
    onclose?: ((e: CloseEvent) => void) | null;
}

/** Incremental update of the current conversation delivered from the client.

 All the content here will unconditionally be appended to the conversation
 history and used as part of the prompt to the model to generate content.

 A message here will interrupt any current model generation.
 */
export declare interface LiveClientContent {
    /** The content appended to the current conversation with the model.

     For single-turn queries, this is a single instance. For multi-turn
     queries, this is a repeated field that contains conversation history and
     latest request.
     */
    turns?: Content[];
    /** If true, indicates that the server content generation should start with
     the currently accumulated prompt. Otherwise, the server will await
     additional messages before starting generation. */
    turnComplete?: boolean;
}

/** Messages sent by the client in the API call. */
export declare interface LiveClientMessage {
    /** Message to be sent by the system when connecting to the API. SDK users should not send this message. */
    setup?: LiveClientSetup;
    /** Incremental update of the current conversation delivered from the client. */
    clientContent?: LiveClientContent;
    /** User input that is sent in real time. */
    realtimeInput?: LiveClientRealtimeInput;
    /** Response to a `ToolCallMessage` received from the server. */
    toolResponse?: LiveClientToolResponse;
}

/** User input that is sent in real time.

 This is different from `LiveClientContent` in a few ways:

 - Can be sent continuously without interruption to model generation.
 - If there is a need to mix data interleaved across the
 `LiveClientContent` and the `LiveClientRealtimeInput`, server attempts to
 optimize for best response, but there are no guarantees.
 - End of turn is not explicitly specified, but is rather derived from user
 activity (for example, end of speech).
 - Even before the end of turn, the data is processed incrementally
 to optimize for a fast start of the response from the model.
 - Is always assumed to be the user's input (cannot be used to populate
 conversation history).
 */
export declare interface LiveClientRealtimeInput {
    /** Inlined bytes data for media input. */
    mediaChunks?: Blob_2[];
    /** The realtime audio input stream. */
    audio?: Blob_2;
    /**
     Indicates that the audio stream has ended, e.g. because the microphone was
     turned off.

     This should only be sent when automatic activity detection is enabled
     (which is the default).

     The client can reopen the stream by sending an audio message.
     */
    audioStreamEnd?: boolean;
    /** The realtime video input stream. */
    video?: Blob_2;
    /** The realtime text input stream. */
    text?: string;
    /** Marks the start of user activity. */
    activityStart?: ActivityStart;
    /** Marks the end of user activity. */
    activityEnd?: ActivityEnd;
}

/** Message contains configuration that will apply for the duration of the streaming session. */
export declare interface LiveClientSetup {
    /**
     The fully qualified name of the publisher model or tuned model endpoint to
     use.
     */
    model?: string;
    /** The generation configuration for the session.
     Note: only a subset of fields are supported.
     */
    generationConfig?: GenerationConfig;
    /** The user provided system instructions for the model.
     Note: only text should be used in parts and content in each part will be
     in a separate paragraph. */
    systemInstruction?: ContentUnion;
    /**  A list of `Tools` the model may use to generate the next response.

     A `Tool` is a piece of code that enables the system to interact with
     external systems to perform an action, or set of actions, outside of
     knowledge and scope of the model. */
    tools?: ToolListUnion;
    /** Configures the realtime input behavior in BidiGenerateContent. */
    realtimeInputConfig?: RealtimeInputConfig;
    /** Configures session resumption mechanism.

     If included server will send SessionResumptionUpdate messages. */
    sessionResumption?: SessionResumptionConfig;
    /** Configures context window compression mechanism.

     If included, server will compress context window to fit into given length. */
    contextWindowCompression?: ContextWindowCompressionConfig;
    /** The transcription of the input aligns with the input audio language.
     */
    inputAudioTranscription?: AudioTranscriptionConfig;
    /** The transcription of the output aligns with the language code
     specified for the output audio.
     */
    outputAudioTranscription?: AudioTranscriptionConfig;
}

/** Client generated response to a `ToolCall` received from the server.

 Individual `FunctionResponse` objects are matched to the respective
 `FunctionCall` objects by the `id` field.

 Note that in the unary and server-streaming GenerateContent APIs function
 calling happens by exchanging the `Content` parts, while in the bidi
 GenerateContent APIs function calling happens over this dedicated set of
 messages.
 */
export declare class LiveClientToolResponse {
    /** The response to the function calls. */
    functionResponses?: FunctionResponse[];
}

/** Session config for the API connection. */
export declare interface LiveConnectConfig {
    /** The generation configuration for the session. */
    generationConfig?: GenerationConfig;
    /** The requested modalities of the response. Represents the set of
     modalities that the model can return. Defaults to AUDIO if not specified.
     */
    responseModalities?: Modality[];
    /** Value that controls the degree of randomness in token selection.
     Lower temperatures are good for prompts that require a less open-ended or
     creative response, while higher temperatures can lead to more diverse or
     creative results.
     */
    temperature?: number;
    /** Tokens are selected from the most to least probable until the sum
     of their probabilities equals this value. Use a lower value for less
     random responses and a higher value for more random responses.
     */
    topP?: number;
    /** For each token selection step, the ``top_k`` tokens with the
     highest probabilities are sampled. Then tokens are further filtered based
     on ``top_p`` with the final token selected using temperature sampling. Use
     a lower number for less random responses and a higher number for more
     random responses.
     */
    topK?: number;
    /** Maximum number of tokens that can be generated in the response.
     */
    maxOutputTokens?: number;
    /** If specified, the media resolution specified will be used.
     */
    mediaResolution?: MediaResolution;
    /** When ``seed`` is fixed to a specific number, the model makes a best
     effort to provide the same response for repeated requests. By default, a
     random number is used.
     */
    seed?: number;
    /** The speech generation configuration.
     */
    speechConfig?: SpeechConfig;
    /** The user provided system instructions for the model.
     Note: only text should be used in parts and content in each part will be
     in a separate paragraph. */
    systemInstruction?: ContentUnion;
    /** A list of `Tools` the model may use to generate the next response.

     A `Tool` is a piece of code that enables the system to interact with
     external systems to perform an action, or set of actions, outside of
     knowledge and scope of the model. */
    tools?: ToolListUnion;
    /** Configures session resumption mechanism.

     If included the server will send SessionResumptionUpdate messages. */
    sessionResumption?: SessionResumptionConfig;
    /** The transcription of the input aligns with the input audio language.
     */
    inputAudioTranscription?: AudioTranscriptionConfig;
    /** The transcription of the output aligns with the language code
     specified for the output audio.
     */
    outputAudioTranscription?: AudioTranscriptionConfig;
    /** Configures the realtime input behavior in BidiGenerateContent. */
    realtimeInputConfig?: RealtimeInputConfig;
    /** Configures context window compression mechanism.

     If included, server will compress context window to fit into given length. */
    contextWindowCompression?: ContextWindowCompressionConfig;
}

/** Parameters for connecting to the live API. */
export declare interface LiveConnectParameters {
    /** ID of the model to use. For a list of models, see `Google models
     <https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models>`_. */
    model: string;
    /** callbacks */
    callbacks: LiveCallbacks;
    /** Optional configuration parameters for the request.
     */
    config?: LiveConnectConfig;
}

/** Parameters for sending client content to the live API. */
export declare interface LiveSendClientContentParameters {
    /** Client content to send to the session. */
    turns?: ContentListUnion;
    /** If true, indicates that the server content generation should start with
     the currently accumulated prompt. Otherwise, the server will await
     additional messages before starting generation. */
    turnComplete?: boolean;
}

/** Parameters for sending realtime input to the live API. */
export declare interface LiveSendRealtimeInputParameters {
    /** Realtime input to send to the session. */
    media?: BlobImageUnion;
    /** The realtime audio input stream. */
    audio?: Blob_2;
    /**
     Indicates that the audio stream has ended, e.g. because the microphone was
     turned off.

     This should only be sent when automatic activity detection is enabled
     (which is the default).

     The client can reopen the stream by sending an audio message.
     */
    audioStreamEnd?: boolean;
    /** The realtime video input stream. */
    video?: BlobImageUnion;
    /** The realtime text input stream. */
    text?: string;
    /** Marks the start of user activity. */
    activityStart?: ActivityStart;
    /** Marks the end of user activity. */
    activityEnd?: ActivityEnd;
}

/** Parameters for sending tool responses to the live API. */
export declare class LiveSendToolResponseParameters {
    /** Tool responses to send to the session. */
    functionResponses: FunctionResponse[] | FunctionResponse;
}

/** Incremental server update generated by the model in response to client messages.

 Content is generated as quickly as possible, and not in real time. Clients
 may choose to buffer and play it out in real time.
 */
export declare interface LiveServerContent {
    /** The content that the model has generated as part of the current conversation with the user. */
    modelTurn?: Content;
    /** If true, indicates that the model is done generating. Generation will only start in response to additional client messages. Can be set alongside `content`, indicating that the `content` is the last in the turn. */
    turnComplete?: boolean;
    /** If true, indicates that a client message has interrupted current model generation. If the client is playing out the content in realtime, this is a good signal to stop and empty the current queue. */
    interrupted?: boolean;
    /** Metadata returned to client when grounding is enabled. */
    groundingMetadata?: GroundingMetadata;
    /** If true, indicates that the model is done generating. When model is
     interrupted while generating there will be no generation_complete message
     in interrupted turn, it will go through interrupted > turn_complete.
     When model assumes realtime playback there will be delay between
     generation_complete and turn_complete that is caused by model
     waiting for playback to finish. If true, indicates that the model
     has finished generating all content. This is a signal to the client
     that it can stop sending messages. */
    generationComplete?: boolean;
    /** Input transcription. The transcription is independent to the model
     turn which means it doesn’t imply any ordering between transcription and
     model turn. */
    inputTranscription?: Transcription;
    /** Output transcription. The transcription is independent to the model
     turn which means it doesn’t imply any ordering between transcription and
     model turn.
     */
    outputTranscription?: Transcription;
}

/** Server will not be able to service client soon. */
export declare interface LiveServerGoAway {
    /** The remaining time before the connection will be terminated as ABORTED. The minimal time returned here is specified differently together with the rate limits for a given model. */
    timeLeft?: string;
}

/** Response message for API call. */
export declare class LiveServerMessage {
    /** Sent in response to a `LiveClientSetup` message from the client. */
    setupComplete?: LiveServerSetupComplete;
    /** Content generated by the model in response to client messages. */
    serverContent?: LiveServerContent;
    /** Request for the client to execute the `function_calls` and return the responses with the matching `id`s. */
    toolCall?: LiveServerToolCall;
    /** Notification for the client that a previously issued `ToolCallMessage` with the specified `id`s should have been not executed and should be cancelled. */
    toolCallCancellation?: LiveServerToolCallCancellation;
    /** Usage metadata about model response(s). */
    usageMetadata?: UsageMetadata;
    /** Server will disconnect soon. */
    goAway?: LiveServerGoAway;
    /** Update of the session resumption state. */
    sessionResumptionUpdate?: LiveServerSessionResumptionUpdate;
    /**
     * Returns the concatenation of all text parts from the server content if present.
     *
     * @remarks
     * If there are non-text parts in the response, the concatenation of all text
     * parts will be returned, and a warning will be logged.
     */
    get text(): string | undefined;
    /**
     * Returns the concatenation of all inline data parts from the server content if present.
     *
     * @remarks
     * If there are non-inline data parts in the
     * response, the concatenation of all inline data parts will be returned, and
     * a warning will be logged.
     */
    get data(): string | undefined;
}

/** Update of the session resumption state.

 Only sent if `session_resumption` was set in the connection config.
 */
export declare interface LiveServerSessionResumptionUpdate {
    /** New handle that represents state that can be resumed. Empty if `resumable`=false. */
    newHandle?: string;
    /** True if session can be resumed at this point. It might be not possible to resume session at some points. In that case we send update empty new_handle and resumable=false. Example of such case could be model executing function calls or just generating. Resuming session (using previous session token) in such state will result in some data loss. */
    resumable?: boolean;
    /** Index of last message sent by client that is included in state represented by this SessionResumptionToken. Only sent when `SessionResumptionConfig.transparent` is set.

     Presence of this index allows users to transparently reconnect and avoid issue of losing some part of realtime audio input/video. If client wishes to temporarily disconnect (for example as result of receiving GoAway) they can do it without losing state by buffering messages sent since last `SessionResmumptionTokenUpdate`. This field will enable them to limit buffering (avoid keeping all requests in RAM).

     Note: This should not be used for when resuming a session at some time later -- in those cases partial audio and video frames arelikely not needed. */
    lastConsumedClientMessageIndex?: string;
}

/** Sent in response to a `LiveGenerateContentSetup` message from the client. */
export declare interface LiveServerSetupComplete {
}

/** Request for the client to execute the `function_calls` and return the responses with the matching `id`s. */
export declare interface LiveServerToolCall {
    /** The function call to be executed. */
    functionCalls?: FunctionCall[];
}

/** Notification for the client that a previously issued `ToolCallMessage` with the specified `id`s should have been not executed and should be cancelled.

 If there were side-effects to those tool calls, clients may attempt to undo
 the tool calls. This message occurs only in cases where the clients interrupt
 server turns.
 */
export declare interface LiveServerToolCallCancellation {
    /** The ids of the tool calls to be cancelled. */
    ids?: string[];
}

/** Logprobs Result */
export declare interface LogprobsResult {
    /** Length = total number of decoding steps. The chosen candidates may or may not be in top_candidates. */
    chosenCandidates?: LogprobsResultCandidate[];
    /** Length = total number of decoding steps. */
    topCandidates?: LogprobsResultTopCandidates[];
}

/** Candidate for the logprobs token and score. */
export declare interface LogprobsResultCandidate {
    /** The candidate's log probability. */
    logProbability?: number;
    /** The candidate's token string value. */
    token?: string;
    /** The candidate's token id value. */
    tokenId?: number;
}

/** Candidates with top log probabilities at each decoding step. */
export declare interface LogprobsResultTopCandidates {
    /** Sorted by log probability in descending order. */
    candidates?: LogprobsResultCandidate[];
}

/** Configuration for a Mask reference image. */
export declare interface MaskReferenceConfig {
    /** Prompts the model to generate a mask instead of you needing to
     provide one (unless MASK_MODE_USER_PROVIDED is used). */
    maskMode?: MaskReferenceMode;
    /** A list of up to 5 class ids to use for semantic segmentation.
     Automatically creates an image mask based on specific objects. */
    segmentationClasses?: number[];
    /** Dilation percentage of the mask provided.
     Float between 0 and 1. */
    maskDilation?: number;
}

/** A mask reference image.

 This encapsulates either a mask image provided by the user and configs for
 the user provided mask, or only config parameters for the model to generate
 a mask.

 A mask image is an image whose non-zero values indicate where to edit the base
 image. If the user provides a mask image, the mask must be in the same
 dimensions as the raw image.
 */
export declare interface MaskReferenceImage {
    /** The reference image for the editing operation. */
    referenceImage?: Image_2;
    /** The id of the reference image. */
    referenceId?: number;
    /** The type of the reference image. Only set by the SDK. */
    referenceType?: string;
    /** Configuration for the mask reference image. */
    config?: MaskReferenceConfig;
}

/** Enum representing the mask mode of a mask reference image. */
export declare enum MaskReferenceMode {
    MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT",
    MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED",
    MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND",
    MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND",
    MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC"
}

/** Server content modalities. */
export declare enum MediaModality {
    MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED",
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT"
}

/** The media resolution to use. */
export declare enum MediaResolution {
    MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED",
    MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW",
    MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM",
    MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH"
}

/** Server content modalities. */
export declare enum Modality {
    MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED",
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    AUDIO = "AUDIO"
}

/** Represents token counting info for a single modality. */
export declare interface ModalityTokenCount {
    /** The modality associated with this token count. */
    modality?: MediaModality;
    /** Number of tokens. */
    tokenCount?: number;
}

/** The mode of the predictor to be used in dynamic retrieval. */
export declare enum Mode {
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED",
    MODE_DYNAMIC = "MODE_DYNAMIC"
}

/** A trained machine learning model. */
export declare interface Model {
    /** Resource name of the model. */
    name?: string;
    /** Display name of the model. */
    displayName?: string;
    /** Description of the model. */
    description?: string;
    /** Version ID of the model. A new version is committed when a new
     model version is uploaded or trained under an existing model ID. The
     version ID is an auto-incrementing decimal number in string
     representation. */
    version?: string;
    /** List of deployed models created from this base model. Note that a
     model could have been deployed to endpoints in different locations. */
    endpoints?: Endpoint[];
    /** Labels with user-defined metadata to organize your models. */
    labels?: Record<string, string>;
    /** Information about the tuned model from the base model. */
    tunedModelInfo?: TunedModelInfo;
    /** The maximum number of input tokens that the model can handle. */
    inputTokenLimit?: number;
    /** The maximum number of output tokens that the model can generate. */
    outputTokenLimit?: number;
    /** List of actions that are supported by the model. */
    supportedActions?: string[];
}

export declare class Models extends BaseModule {
    private readonly apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Makes an API request to generate content with a given model.
     *
     * For the `model` parameter, supported formats for Vertex AI API include:
     * - The Gemini model ID, for example: 'gemini-2.0-flash'
     * - The full resource name starts with 'projects/', for example:
     *  'projects/my-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash'
     * - The partial resource name with 'publishers/', for example:
     *  'publishers/google/models/gemini-2.0-flash' or
     *  'publishers/meta/models/llama-3.1-405b-instruct-maas'
     * - `/` separated publisher and model name, for example:
     * 'google/gemini-2.0-flash' or 'meta/llama-3.1-405b-instruct-maas'
     *
     * For the `model` parameter, supported formats for Gemini API include:
     * - The Gemini model ID, for example: 'gemini-2.0-flash'
     * - The model name starts with 'models/', for example:
     *  'models/gemini-2.0-flash'
     * - For tuned models, the model name starts with 'tunedModels/',
     * for example:
     * 'tunedModels/1234567890123456789'
     *
     * Some models support multimodal input and output.
     *
     * @param params - The parameters for generating content.
     * @return The response from generating content.
     *
     * @example
     * ```ts
     * const response = await ai.models.generateContent({
     *   model: 'gemini-2.0-flash',
     *   contents: 'why is the sky blue?',
     *   config: {
     *     candidateCount: 2,
     *   }
     * });
     * console.log(response);
     * ```
     */
    generateContent: (params: types.GenerateContentParameters) => Promise<types.GenerateContentResponse>;
    /**
     * Makes an API request to generate content with a given model and yields the
     * response in chunks.
     *
     * For the `model` parameter, supported formats for Vertex AI API include:
     * - The Gemini model ID, for example: 'gemini-2.0-flash'
     * - The full resource name starts with 'projects/', for example:
     *  'projects/my-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash'
     * - The partial resource name with 'publishers/', for example:
     *  'publishers/google/models/gemini-2.0-flash' or
     *  'publishers/meta/models/llama-3.1-405b-instruct-maas'
     * - `/` separated publisher and model name, for example:
     * 'google/gemini-2.0-flash' or 'meta/llama-3.1-405b-instruct-maas'
     *
     * For the `model` parameter, supported formats for Gemini API include:
     * - The Gemini model ID, for example: 'gemini-2.0-flash'
     * - The model name starts with 'models/', for example:
     *  'models/gemini-2.0-flash'
     * - For tuned models, the model name starts with 'tunedModels/',
     * for example:
     *  'tunedModels/1234567890123456789'
     *
     * Some models support multimodal input and output.
     *
     * @param params - The parameters for generating content with streaming response.
     * @return The response from generating content.
     *
     * @example
     * ```ts
     * const response = await ai.models.generateContentStream({
     *   model: 'gemini-2.0-flash',
     *   contents: 'why is the sky blue?',
     *   config: {
     *     maxOutputTokens: 200,
     *   }
     * });
     * for await (const chunk of response) {
     *   console.log(chunk);
     * }
     * ```
     */
    generateContentStream: (params: types.GenerateContentParameters) => Promise<AsyncGenerator<types.GenerateContentResponse>>;
    /**
     * Generates an image based on a text description and configuration.
     *
     * @param model - The model to use.
     * @param prompt - A text description of the image to generate.
     * @param [config] - The config for image generation.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await client.models.generateImages({
     *  model: 'imagen-3.0-generate-002',
     *  prompt: 'Robot holding a red skateboard',
     *  config: {
     *    numberOfImages: 1,
     *    includeRaiReason: true,
     *  },
     * });
     * console.log(response?.generatedImages?.[0]?.image?.imageBytes);
     * ```
     */
    generateImages: (params: types.GenerateImagesParameters) => Promise<types.GenerateImagesResponse>;
    list: (params?: types.ListModelsParameters) => Promise<Pager<types.Model>>;
    private generateContentInternal;
    private generateContentStreamInternal;
    /**
     * Calculates embeddings for the given contents. Only text is supported.
     *
     * @param params - The parameters for embedding contents.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.embedContent({
     *  model: 'text-embedding-004',
     *  contents: [
     *    'What is your name?',
     *    'What is your favorite color?',
     *  ],
     *  config: {
     *    outputDimensionality: 64,
     *  },
     * });
     * console.log(response);
     * ```
     */
    embedContent(params: types.EmbedContentParameters): Promise<types.EmbedContentResponse>;
    /**
     * Generates an image based on a text description and configuration.
     *
     * @param params - The parameters for generating images.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.generateImages({
     *  model: 'imagen-3.0-generate-002',
     *  prompt: 'Robot holding a red skateboard',
     *  config: {
     *    numberOfImages: 1,
     *    includeRaiReason: true,
     *  },
     * });
     * console.log(response?.generatedImages?.[0]?.image?.imageBytes);
     * ```
     */
    private generateImagesInternal;
    /**
     * Fetches information about a model by name.
     *
     * @example
     * ```ts
     * const modelInfo = await ai.models.get({model: 'gemini-2.0-flash'});
     * ```
     */
    get(params: types.GetModelParameters): Promise<types.Model>;
    private listInternal;
    /**
     * Updates a tuned model by its name.
     *
     * @param params - The parameters for updating the model.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.update({
     *   model: 'tuned-model-name',
     *   config: {
     *     displayName: 'New display name',
     *     description: 'New description',
     *   },
     * });
     * ```
     */
    update(params: types.UpdateModelParameters): Promise<types.Model>;
    /**
     * Deletes a tuned model by its name.
     *
     * @param params - The parameters for deleting the model.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.delete({model: 'tuned-model-name'});
     * ```
     */
    delete(params: types.DeleteModelParameters): Promise<types.DeleteModelResponse>;
    /**
     * Counts the number of tokens in the given contents. Multimodal input is
     * supported for Gemini models.
     *
     * @param params - The parameters for counting tokens.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.countTokens({
     *  model: 'gemini-2.0-flash',
     *  contents: 'The quick brown fox jumps over the lazy dog.'
     * });
     * console.log(response);
     * ```
     */
    countTokens(params: types.CountTokensParameters): Promise<types.CountTokensResponse>;
    /**
     * Given a list of contents, returns a corresponding TokensInfo containing
     * the list of tokens and list of token ids.
     *
     * This method is not supported by the Gemini Developer API.
     *
     * @param params - The parameters for computing tokens.
     * @return The response from the API.
     *
     * @example
     * ```ts
     * const response = await ai.models.computeTokens({
     *  model: 'gemini-2.0-flash',
     *  contents: 'What is your name?'
     * });
     * console.log(response);
     * ```
     */
    computeTokens(params: types.ComputeTokensParameters): Promise<types.ComputeTokensResponse>;
    /**
     *  Generates videos based on a text description and configuration.
     *
     * @param params - The parameters for generating videos.
     * @return A Promise<GenerateVideosOperation> which allows you to track the progress and eventually retrieve the generated videos using the operations.get method.
     *
     * @example
     * ```ts
     * const operation = await ai.models.generateVideos({
     *  model: 'veo-2.0-generate-001',
     *  prompt: 'A neon hologram of a cat driving at top speed',
     *  config: {
     *    numberOfVideos: 1
     * });
     *
     * while (!operation.done) {
     *   await new Promise(resolve => setTimeout(resolve, 10000));
     *   operation = await ai.operations.getVideosOperation({operation: operation});
     * }
     *
     * console.log(operation.response?.generatedVideos?.[0]?.video?.uri);
     * ```
     */
    generateVideos(params: types.GenerateVideosParameters): Promise<types.GenerateVideosOperation>;
}

/** Config for model selection. */
export declare interface ModelSelectionConfig {
    /** Options for feature selection preference. */
    featureSelectionPreference?: FeatureSelectionPreference;
}

/** A long-running operation. */
export declare interface Operation {
    /** The server-assigned name, which is only unique within the same service that originally returns it. If you use the default HTTP mapping, the `name` should be a resource name ending with `operations/{unique_id}`. */
    name?: string;
    /** Service-specific metadata associated with the operation. It typically contains progress information and common metadata such as create time. Some services might not provide such metadata.  Any method that returns a long-running operation should document the metadata type, if any. */
    metadata?: Record<string, unknown>;
    /** If the value is `false`, it means the operation is still in progress. If `true`, the operation is completed, and either `error` or `response` is available. */
    done?: boolean;
    /** The error result of the operation in case of failure or cancellation. */
    error?: Record<string, unknown>;
}

/** Parameters for the get method of the operations module. */
export declare interface OperationGetParameters {
    /** The operation to be retrieved. */
    operation: GenerateVideosOperation;
    /** Used to override the default configuration. */
    config?: GetOperationConfig;
}

export declare class Operations extends BaseModule {
    private readonly apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Gets the status of a long-running operation.
     *
     * @param parameters The parameters for the get operation request.
     * @return The updated Operation object, with the latest status or result.
     */
    getVideosOperation(parameters: types.OperationGetParameters): Promise<types.GenerateVideosOperation>;
    private getVideosOperationInternal;
    private fetchPredictVideosOperationInternal;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/** Required. Outcome of the code execution. */
export declare enum Outcome {
    OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED",
    OUTCOME_OK = "OUTCOME_OK",
    OUTCOME_FAILED = "OUTCOME_FAILED",
    OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED"
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Pagers for the GenAI List APIs.
 */
export declare enum PagedItem {
    PAGED_ITEM_BATCH_JOBS = "batchJobs",
    PAGED_ITEM_MODELS = "models",
    PAGED_ITEM_TUNING_JOBS = "tuningJobs",
    PAGED_ITEM_FILES = "files",
    PAGED_ITEM_CACHED_CONTENTS = "cachedContents"
}

declare interface PagedItemConfig {
    config?: {
        pageToken?: string;
        pageSize?: number;
    };
}

declare interface PagedItemResponse<T> {
    nextPageToken?: string;
    batchJobs?: T[];
    models?: T[];
    tuningJobs?: T[];
    files?: T[];
    cachedContents?: T[];
}

/**
 * Pager class for iterating through paginated results.
 */
export declare class Pager<T> implements AsyncIterable<T> {
    private nameInternal;
    private pageInternal;
    private paramsInternal;
    private pageInternalSize;
    protected requestInternal: (params: PagedItemConfig) => Promise<PagedItemResponse<T>>;
    protected idxInternal: number;
    constructor(name: PagedItem, request: (params: PagedItemConfig) => Promise<PagedItemResponse<T>>, response: PagedItemResponse<T>, params: PagedItemConfig);
    private init;
    private initNextPage;
    /**
     * Returns the current page, which is a list of items.
     *
     * @remarks
     * The first page is retrieved when the pager is created. The returned list of
     * items could be a subset of the entire list.
     */
    get page(): T[];
    /**
     * Returns the type of paged item (for example, ``batch_jobs``).
     */
    get name(): PagedItem;
    /**
     * Returns the length of the page fetched each time by this pager.
     *
     * @remarks
     * The number of items in the page is less than or equal to the page length.
     */
    get pageSize(): number;
    /**
     * Returns the parameters when making the API request for the next page.
     *
     * @remarks
     * Parameters contain a set of optional configs that can be
     * used to customize the API request. For example, the `pageToken` parameter
     * contains the token to request the next page.
     */
    get params(): PagedItemConfig;
    /**
     * Returns the total number of items in the current page.
     */
    get pageLength(): number;
    /**
     * Returns the item at the given index.
     */
    getItem(index: number): T;
    /**
     * Returns an async iterator that support iterating through all items
     * retrieved from the API.
     *
     * @remarks
     * The iterator will automatically fetch the next page if there are more items
     * to fetch from the API.
     *
     * @example
     *
     * ```ts
     * const pager = await ai.files.list({config: {pageSize: 10}});
     * for await (const file of pager) {
     *   console.log(file.name);
     * }
     * ```
     */
    [Symbol.asyncIterator](): AsyncIterator<T>;
    /**
     * Fetches the next page of items. This makes a new API request.
     *
     * @throws {Error} If there are no more pages to fetch.
     *
     * @example
     *
     * ```ts
     * const pager = await ai.files.list({config: {pageSize: 10}});
     * let page = pager.page;
     * while (true) {
     *   for (const file of page) {
     *     console.log(file.name);
     *   }
     *   if (!pager.hasNextPage()) {
     *     break;
     *   }
     *   page = await pager.nextPage();
     * }
     * ```
     */
    nextPage(): Promise<T[]>;
    /**
     * Returns true if there are more pages to fetch from the API.
     */
    hasNextPage(): boolean;
}

/** A datatype containing media content.

 Exactly one field within a Part should be set, representing the specific type
 of content being conveyed. Using multiple fields within the same `Part`
 instance is considered invalid.
 */
export declare interface Part {
    /** Metadata for a given video. */
    videoMetadata?: VideoMetadata;
    /** Indicates if the part is thought from the model. */
    thought?: boolean;
    /** Optional. Result of executing the [ExecutableCode]. */
    codeExecutionResult?: CodeExecutionResult;
    /** Optional. Code generated by the model that is meant to be executed. */
    executableCode?: ExecutableCode;
    /** Optional. URI based data. */
    fileData?: FileData;
    /** Optional. A predicted [FunctionCall] returned from the model that contains a string representing the [FunctionDeclaration.name] with the parameters and their values. */
    functionCall?: FunctionCall;
    /** Optional. The result output of a [FunctionCall] that contains a string representing the [FunctionDeclaration.name] and a structured JSON object containing any output from the function call. It is used as context to the model. */
    functionResponse?: FunctionResponse;
    /** Optional. Inlined bytes data. */
    inlineData?: Blob_2;
    /** Optional. Text part (can be code). */
    text?: string;
}

export declare type PartListUnion = PartUnion[] | PartUnion;

/** Tuning spec for Partner models. */
export declare interface PartnerModelTuningSpec {
    /** Hyperparameters for tuning. The accepted hyper_parameters and their valid range of values will differ depending on the base model. */
    hyperParameters?: Record<string, unknown>;
    /** Required. Cloud Storage path to file containing training dataset for tuning. The dataset must be formatted as a JSONL file. */
    trainingDatasetUri?: string;
    /** Optional. Cloud Storage path to file containing validation dataset for tuning. The dataset must be formatted as a JSONL file. */
    validationDatasetUri?: string;
}

export declare type PartUnion = Part | string;

/** Enum that controls the generation of people. */
export declare enum PersonGeneration {
    DONT_ALLOW = "DONT_ALLOW",
    ALLOW_ADULT = "ALLOW_ADULT",
    ALLOW_ALL = "ALLOW_ALL"
}

/** The configuration for the prebuilt speaker to use. */
export declare interface PrebuiltVoiceConfig {
    /** The name of the prebuilt voice to use.
     */
    voiceName?: string;
}

/** Specifies the context retrieval config. */
export declare interface RagRetrievalConfig {
    /** Optional. Config for filters. */
    filter?: RagRetrievalConfigFilter;
    /** Optional. Config for Hybrid Search. */
    hybridSearch?: RagRetrievalConfigHybridSearch;
    /** Optional. Config for ranking and reranking. */
    ranking?: RagRetrievalConfigRanking;
    /** Optional. The number of contexts to retrieve. */
    topK?: number;
}

/** Config for filters. */
export declare interface RagRetrievalConfigFilter {
    /** Optional. String for metadata filtering. */
    metadataFilter?: string;
    /** Optional. Only returns contexts with vector distance smaller than the threshold. */
    vectorDistanceThreshold?: number;
    /** Optional. Only returns contexts with vector similarity larger than the threshold. */
    vectorSimilarityThreshold?: number;
}

/** Config for Hybrid Search. */
export declare interface RagRetrievalConfigHybridSearch {
    /** Optional. Alpha value controls the weight between dense and sparse vector search results. The range is [0, 1], while 0 means sparse vector search only and 1 means dense vector search only. The default value is 0.5 which balances sparse and dense vector search equally. */
    alpha?: number;
}

/** Config for ranking and reranking. */
export declare interface RagRetrievalConfigRanking {
    /** Optional. Config for LlmRanker. */
    llmRanker?: RagRetrievalConfigRankingLlmRanker;
    /** Optional. Config for Rank Service. */
    rankService?: RagRetrievalConfigRankingRankService;
}

/** Config for LlmRanker. */
export declare interface RagRetrievalConfigRankingLlmRanker {
    /** Optional. The model name used for ranking. Format: `gemini-1.5-pro` */
    modelName?: string;
}

/** Config for Rank Service. */
export declare interface RagRetrievalConfigRankingRankService {
    /** Optional. The model name of the rank service. Format: `semantic-ranker-512@latest` */
    modelName?: string;
}

/** A raw reference image.

 A raw reference image represents the base image to edit, provided by the user.
 It can optionally be provided in addition to a mask reference image or
 a style reference image.
 */
export declare interface RawReferenceImage {
    /** The reference image for the editing operation. */
    referenceImage?: Image_2;
    /** The id of the reference image. */
    referenceId?: number;
    /** The type of the reference image. Only set by the SDK. */
    referenceType?: string;
}

/** Marks the end of user activity.

 This can only be sent if automatic (i.e. server-side) activity detection is
 disabled.
 */
export declare interface RealtimeInputConfig {
    /** If not set, automatic activity detection is enabled by default. If automatic voice detection is disabled, the client must send activity signals. */
    automaticActivityDetection?: AutomaticActivityDetection;
    /** Defines what effect activity has. */
    activityHandling?: ActivityHandling;
    /** Defines which input is included in the user's turn. */
    turnCoverage?: TurnCoverage;
}

/** Represents a recorded session. */
export declare interface ReplayFile {
    replayId?: string;
    interactions?: ReplayInteraction[];
}

/** Represents a single interaction, request and response in a replay. */
export declare interface ReplayInteraction {
    request?: ReplayRequest;
    response?: ReplayResponse;
}

/** Represents a single request in a replay. */
export declare interface ReplayRequest {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    bodySegments?: Record<string, unknown>[];
}

/** Represents a single response in a replay. */
export declare class ReplayResponse {
    statusCode?: number;
    headers?: Record<string, string>;
    bodySegments?: Record<string, unknown>[];
    sdkResponseSegments?: Record<string, unknown>[];
}

/** Defines a retrieval tool that model can call to access external knowledge. */
export declare interface Retrieval {
    /** Optional. Deprecated. This option is no longer supported. */
    disableAttribution?: boolean;
    /** Set to use data source powered by Vertex AI Search. */
    vertexAiSearch?: VertexAISearch;
    /** Set to use data source powered by Vertex RAG store. User data is uploaded via the VertexRagDataService. */
    vertexRagStore?: VertexRagStore;
}

/** Retrieval config.
 */
export declare interface RetrievalConfig {
    /** Optional. The location of the user. */
    latLng?: LatLng;
}

/** Metadata related to retrieval in the grounding flow. */
export declare interface RetrievalMetadata {
    /** Optional. Score indicating how likely information from Google Search could help answer the prompt. The score is in the range `[0, 1]`, where 0 is the least likely and 1 is the most likely. This score is only populated when Google Search grounding and dynamic retrieval is enabled. It will be compared to the threshold to determine whether to trigger Google Search. */
    googleSearchDynamicRetrievalScore?: number;
}

/** Safety attributes of a GeneratedImage or the user-provided prompt. */
export declare interface SafetyAttributes {
    /** List of RAI categories.
     */
    categories?: string[];
    /** List of scores of each categories.
     */
    scores?: number[];
    /** Internal use only.
     */
    contentType?: string;
}

/** Enum that controls the safety filter level for objectionable content. */
export declare enum SafetyFilterLevel {
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
    BLOCK_NONE = "BLOCK_NONE"
}

/** Safety rating corresponding to the generated content. */
export declare interface SafetyRating {
    /** Output only. Indicates whether the content was filtered out because of this rating. */
    blocked?: boolean;
    /** Output only. Harm category. */
    category?: HarmCategory;
    /** Output only. Harm probability levels in the content. */
    probability?: HarmProbability;
    /** Output only. Harm probability score. */
    probabilityScore?: number;
    /** Output only. Harm severity levels in the content. */
    severity?: HarmSeverity;
    /** Output only. Harm severity score. */
    severityScore?: number;
}

/** Safety settings. */
export declare interface SafetySetting {
    /** Determines if the harm block method uses probability or probability
     and severity scores. */
    method?: HarmBlockMethod;
    /** Required. Harm category. */
    category?: HarmCategory;
    /** Required. The harm block threshold. */
    threshold?: HarmBlockThreshold;
}

/** Schema is used to define the format of input/output data. Represents a select subset of an [OpenAPI 3.0 schema object](https://spec.openapis.org/oas/v3.0.3#schema-object). More fields may be added in the future as needed. */
export declare interface Schema {
    /** Optional. The value should be validated against any (one or more) of the subschemas in the list. */
    anyOf?: Schema[];
    /** Optional. Default value of the data. */
    default?: unknown;
    /** Optional. The description of the data. */
    description?: string;
    /** Optional. Possible values of the element of primitive type with enum format. Examples: 1. We can define direction as : {type:STRING, format:enum, enum:["EAST", NORTH", "SOUTH", "WEST"]} 2. We can define apartment number as : {type:INTEGER, format:enum, enum:["101", "201", "301"]} */
    enum?: string[];
    /** Optional. Example of the object. Will only populated when the object is the root. */
    example?: unknown;
    /** Optional. The format of the data. Supported formats: for NUMBER type: "float", "double" for INTEGER type: "int32", "int64" for STRING type: "email", "byte", etc */
    format?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE ARRAY Schema of the elements of Type.ARRAY. */
    items?: Schema;
    /** Optional. Maximum number of the elements for Type.ARRAY. */
    maxItems?: string;
    /** Optional. Maximum length of the Type.STRING */
    maxLength?: string;
    /** Optional. Maximum number of the properties for Type.OBJECT. */
    maxProperties?: string;
    /** Optional. Maximum value of the Type.INTEGER and Type.NUMBER */
    maximum?: number;
    /** Optional. Minimum number of the elements for Type.ARRAY. */
    minItems?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE STRING Minimum length of the Type.STRING */
    minLength?: string;
    /** Optional. Minimum number of the properties for Type.OBJECT. */
    minProperties?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE INTEGER and NUMBER Minimum value of the Type.INTEGER and Type.NUMBER */
    minimum?: number;
    /** Optional. Indicates if the value may be null. */
    nullable?: boolean;
    /** Optional. Pattern of the Type.STRING to restrict a string to a regular expression. */
    pattern?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE OBJECT Properties of Type.OBJECT. */
    properties?: Record<string, Schema>;
    /** Optional. The order of the properties. Not a standard field in open api spec. Only used to support the order of the properties. */
    propertyOrdering?: string[];
    /** Optional. Required properties of Type.OBJECT. */
    required?: string[];
    /** Optional. The title of the Schema. */
    title?: string;
    /** Optional. The type of the data. */
    type?: Type;
}

export declare type SchemaUnion = Schema;

/** Google search entry point. */
export declare interface SearchEntryPoint {
    /** Optional. Web content snippet that can be embedded in a web page or an app webview. */
    renderedContent?: string;
    /** Optional. Base64 encoded JSON representing array of tuple. */
    sdkBlob?: string;
}

/** Segment of the content. */
export declare interface Segment {
    /** Output only. End index in the given Part, measured in bytes. Offset from the start of the Part, exclusive, starting at zero. */
    endIndex?: number;
    /** Output only. The index of a Part object within its parent Content object. */
    partIndex?: number;
    /** Output only. Start index in the given Part, measured in bytes. Offset from the start of the Part, inclusive, starting at zero. */
    startIndex?: number;
    /** Output only. The text corresponding to the segment from the response. */
    text?: string;
}

/** Parameters for sending a message within a chat session.

 These parameters are used with the `chat.sendMessage()` method.
 */
export declare interface SendMessageParameters {
    /** The message to send to the model.

     The SDK will combine all parts into a single 'user' content to send to
     the model.
     */
    message: PartListUnion;
    /**  Config for this specific request.

     Please note that the per-request config does not change the chat level
     config, nor inherit from it. If you intend to use some values from the
     chat's default config, you must explicitly copy them into this per-request
     config.
     */
    config?: GenerateContentConfig;
}

/**
 Represents a connection to the API.

 @experimental
 */
export declare class Session {
    readonly conn: WebSocket_2;
    private readonly apiClient;
    constructor(conn: WebSocket_2, apiClient: ApiClient);
    private tLiveClientContent;
    private tLiveClienttToolResponse;
    /**
     Send a message over the established connection.

     @param params - Contains two **optional** properties, `turns` and
     `turnComplete`.

     - `turns` will be converted to a `Content[]`
     - `turnComplete: true` [default] indicates that you are done sending
     content and expect a response. If `turnComplete: false`, the server
     will wait for additional messages before starting generation.

     @experimental

     @remarks
     There are two ways to send messages to the live API:
     `sendClientContent` and `sendRealtimeInput`.

     `sendClientContent` messages are added to the model context **in order**.
     Having a conversation using `sendClientContent` messages is roughly
     equivalent to using the `Chat.sendMessageStream`, except that the state of
     the `chat` history is stored on the API server instead of locally.

     Because of `sendClientContent`'s order guarantee, the model cannot respons
     as quickly to `sendClientContent` messages as to `sendRealtimeInput`
     messages. This makes the biggest difference when sending objects that have
     significant preprocessing time (typically images).

     The `sendClientContent` message sends a `Content[]`
     which has more options than the `Blob` sent by `sendRealtimeInput`.

     So the main use-cases for `sendClientContent` over `sendRealtimeInput` are:

     - Sending anything that can't be represented as a `Blob` (text,
     `sendClientContent({turns="Hello?"}`)).
     - Managing turns when not using audio input and voice activity detection.
     (`sendClientContent({turnComplete:true})` or the short form
     `sendClientContent()`)
     - Prefilling a conversation context
     ```
     sendClientContent({
     turns: [
     Content({role:user, parts:...}),
     Content({role:user, parts:...}),
     ...
     ]
     })
     ```
     @experimental
     */
    sendClientContent(params: types.LiveSendClientContentParameters): void;
    /**
     Send a realtime message over the established connection.

     @param params - Contains one property, `media`.

     - `media` will be converted to a `Blob`

     @experimental

     @remarks
     Use `sendRealtimeInput` for realtime audio chunks and video frames (images).

     With `sendRealtimeInput` the api will respond to audio automatically
     based on voice activity detection (VAD).

     `sendRealtimeInput` is optimized for responsivness at the expense of
     deterministic ordering guarantees. Audio and video tokens are to the
     context when they become available.

     Note: The Call signature expects a `Blob` object, but only a subset
     of audio and image mimetypes are allowed.
     */
    sendRealtimeInput(params: types.LiveSendRealtimeInputParameters): void;
    /**
     Send a function response message over the established connection.

     @param params - Contains property `functionResponses`.

     - `functionResponses` will be converted to a `functionResponses[]`

     @remarks
     Use `sendFunctionResponse` to reply to `LiveServerToolCall` from the server.

     Use {@link types.LiveConnectConfig#tools} to configure the callable functions.

     @experimental
     */
    sendToolResponse(params: types.LiveSendToolResponseParameters): void;
    /**
     Terminates the WebSocket connection.

     @experimental

     @example
     ```ts
     let model: string;
     if (GOOGLE_GENAI_USE_VERTEXAI) {
     model = 'gemini-2.0-flash-live-preview-04-09';
     } else {
     model = 'gemini-2.0-flash-live-001';
     }
     const session = await ai.live.connect({
     model: model,
     config: {
     responseModalities: [Modality.AUDIO],
     }
     });

     session.close();
     ```
     */
    close(): void;
}

/** Configuration of session resumption mechanism.

 Included in `LiveConnectConfig.session_resumption`. If included server
 will send `LiveServerSessionResumptionUpdate` messages.
 */
export declare interface SessionResumptionConfig {
    /** Session resumption handle of previous session (session to restore).

     If not present new session will be started. */
    handle?: string;
    /** If set the server will send `last_consumed_client_message_index` in the `session_resumption_update` messages to allow for transparent reconnections. */
    transparent?: boolean;
}

/**
 * Overrides the base URLs for the Gemini API and Vertex AI API.
 *
 * @remarks This function should be called before initializing the SDK. If the
 * base URLs are set after initializing the SDK, the base URLs will not be
 * updated. Base URLs provided in the HttpOptions will also take precedence over
 * URLs set here.
 *
 * @example
 * ```ts
 * import {GoogleGenAI, setDefaultBaseUrls} from '@google/genai';
 * // Override the base URL for the Gemini API.
 * setDefaultBaseUrls({geminiUrl:'https://gemini.google.com'});
 *
 * // Override the base URL for the Vertex AI API.
 * setDefaultBaseUrls({vertexUrl: 'https://vertexai.googleapis.com'});
 *
 * const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
 * ```
 */
export declare function setDefaultBaseUrls(baseUrlParams: BaseUrlParameters): void;

/** Context window will be truncated by keeping only suffix of it.

 Context window will always be cut at start of USER role turn. System
 instructions and `BidiGenerateContentSetup.prefix_turns` will not be
 subject to the sliding window mechanism, they will always stay at the
 beginning of context window.
 */
export declare interface SlidingWindow {
    /** Session reduction target -- how many tokens we should keep. Window shortening operation has some latency costs, so we should avoid running it on every turn. Should be < trigger_tokens. If not set, trigger_tokens/2 is assumed. */
    targetTokens?: string;
}

/** The speech generation configuration. */
export declare interface SpeechConfig {
    /** The configuration for the speaker to use.
     */
    voiceConfig?: VoiceConfig;
    /** Language code (ISO 639. e.g. en-US) for the speech synthesization.
     Only available for Live API.
     */
    languageCode?: string;
}

export declare type SpeechConfigUnion = SpeechConfig | string;

/** Start of speech sensitivity. */
export declare enum StartSensitivity {
    START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED",
    START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH",
    START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW"
}

/** Configuration for a Style reference image. */
export declare interface StyleReferenceConfig {
    /** A text description of the style to use for the generated image. */
    styleDescription?: string;
}

/** A style reference image.

 This encapsulates a style reference image provided by the user, and
 additionally optional config parameters for the style reference image.

 A raw reference image can also be provided as a destination for the style to
 be applied to.
 */
export declare interface StyleReferenceImage {
    /** The reference image for the editing operation. */
    referenceImage?: Image_2;
    /** The id of the reference image. */
    referenceId?: number;
    /** The type of the reference image. Only set by the SDK. */
    referenceType?: string;
    /** Configuration for the style reference image. */
    config?: StyleReferenceConfig;
}

/** Configuration for a Subject reference image. */
export declare interface SubjectReferenceConfig {
    /** The subject type of a subject reference image. */
    subjectType?: SubjectReferenceType;
    /** Subject description for the image. */
    subjectDescription?: string;
}

/** A subject reference image.

 This encapsulates a subject reference image provided by the user, and
 additionally optional config parameters for the subject reference image.

 A raw reference image can also be provided as a destination for the subject to
 be applied to.
 */
export declare interface SubjectReferenceImage {
    /** The reference image for the editing operation. */
    referenceImage?: Image_2;
    /** The id of the reference image. */
    referenceId?: number;
    /** The type of the reference image. Only set by the SDK. */
    referenceType?: string;
    /** Configuration for the subject reference image. */
    config?: SubjectReferenceConfig;
}

/** Enum representing the subject type of a subject reference image. */
export declare enum SubjectReferenceType {
    SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT",
    SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON",
    SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL",
    SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT"
}

/** Hyperparameters for SFT. */
export declare interface SupervisedHyperParameters {
    /** Optional. Adapter size for tuning. */
    adapterSize?: AdapterSize;
    /** Optional. Number of complete passes the model makes over the entire training dataset during training. */
    epochCount?: string;
    /** Optional. Multiplier for adjusting the default learning rate. */
    learningRateMultiplier?: number;
}

/** Dataset distribution for Supervised Tuning. */
export declare interface SupervisedTuningDatasetDistribution {
    /** Output only. Sum of a given population of values that are billable. */
    billableSum?: string;
    /** Output only. Defines the histogram bucket. */
    buckets?: SupervisedTuningDatasetDistributionDatasetBucket[];
    /** Output only. The maximum of the population values. */
    max?: number;
    /** Output only. The arithmetic mean of the values in the population. */
    mean?: number;
    /** Output only. The median of the values in the population. */
    median?: number;
    /** Output only. The minimum of the population values. */
    min?: number;
    /** Output only. The 5th percentile of the values in the population. */
    p5?: number;
    /** Output only. The 95th percentile of the values in the population. */
    p95?: number;
    /** Output only. Sum of a given population of values. */
    sum?: string;
}

/** Dataset bucket used to create a histogram for the distribution given a population of values. */
export declare interface SupervisedTuningDatasetDistributionDatasetBucket {
    /** Output only. Number of values in the bucket. */
    count?: number;
    /** Output only. Left bound of the bucket. */
    left?: number;
    /** Output only. Right bound of the bucket. */
    right?: number;
}

/** Tuning data statistics for Supervised Tuning. */
export declare interface SupervisedTuningDataStats {
    /** Output only. Number of billable characters in the tuning dataset. */
    totalBillableCharacterCount?: string;
    /** Output only. Number of billable tokens in the tuning dataset. */
    totalBillableTokenCount?: string;
    /** The number of examples in the dataset that have been truncated by any amount. */
    totalTruncatedExampleCount?: string;
    /** Output only. Number of tuning characters in the tuning dataset. */
    totalTuningCharacterCount?: string;
    /** A partial sample of the indices (starting from 1) of the truncated examples. */
    truncatedExampleIndices?: string[];
    /** Output only. Number of examples in the tuning dataset. */
    tuningDatasetExampleCount?: string;
    /** Output only. Number of tuning steps for this Tuning Job. */
    tuningStepCount?: string;
    /** Output only. Sample user messages in the training dataset uri. */
    userDatasetExamples?: Content[];
    /** Output only. Dataset distributions for the user input tokens. */
    userInputTokenDistribution?: SupervisedTuningDatasetDistribution;
    /** Output only. Dataset distributions for the messages per example. */
    userMessagePerExampleDistribution?: SupervisedTuningDatasetDistribution;
    /** Output only. Dataset distributions for the user output tokens. */
    userOutputTokenDistribution?: SupervisedTuningDatasetDistribution;
}

/** Tuning Spec for Supervised Tuning for first party models. */
export declare interface SupervisedTuningSpec {
    /** Optional. Hyperparameters for SFT. */
    hyperParameters?: SupervisedHyperParameters;
    /** Required. Cloud Storage path to file containing training dataset for tuning. The dataset must be formatted as a JSONL file. */
    trainingDatasetUri?: string;
    /** Optional. Cloud Storage path to file containing validation dataset for tuning. The dataset must be formatted as a JSONL file. */
    validationDatasetUri?: string;
}

export declare interface TestTableFile {
    comment?: string;
    testMethod?: string;
    parameterNames?: string[];
    testTable?: TestTableItem[];
}

export declare interface TestTableItem {
    /** The name of the test. This is used to derive the replay id. */
    name?: string;
    /** The parameters to the test. Use pydantic models. */
    parameters?: Record<string, unknown>;
    /** Expects an exception for MLDev matching the string. */
    exceptionIfMldev?: string;
    /** Expects an exception for Vertex matching the string. */
    exceptionIfVertex?: string;
    /** Use if you don't want to use the default replay id which is derived from the test name. */
    overrideReplayId?: string;
    /** True if the parameters contain an unsupported union type. This test  will be skipped for languages that do not support the union type. */
    hasUnion?: boolean;
    /** When set to a reason string, this test will be skipped in the API mode. Use this flag for tests that can not be reproduced with the real API. E.g. a test that deletes a resource. */
    skipInApiMode?: string;
    /** Keys to ignore when comparing the request and response. This is useful for tests that are not deterministic. */
    ignoreKeys?: string[];
}

/** The thinking features configuration. */
export declare interface ThinkingConfig {
    /** Indicates whether to include thoughts in the response. If true, thoughts are returned only if the model supports thought and thoughts are available.
     */
    includeThoughts?: boolean;
    /** Indicates the thinking budget in tokens.
     */
    thinkingBudget?: number;
}

/** Tokens info with a list of tokens and the corresponding list of token ids. */
export declare interface TokensInfo {
    /** Optional. Optional fields for the role from the corresponding Content. */
    role?: string;
    /** A list of token ids from the input. */
    tokenIds?: string[];
    /** A list of tokens from the input. */
    tokens?: string[];
}

/** Tool details of a tool that the model may use to generate a response. */
export declare interface Tool {
    /** Optional. Retrieval tool type. System will always execute the provided retrieval tool(s) to get external knowledge to answer the prompt. Retrieval results are presented to the model for generation. */
    retrieval?: Retrieval;
    /** Optional. Google Search tool type. Specialized retrieval tool
     that is powered by Google Search. */
    googleSearch?: GoogleSearch;
    /** Optional. GoogleSearchRetrieval tool type. Specialized retrieval tool that is powered by Google search. */
    googleSearchRetrieval?: GoogleSearchRetrieval;
    /** Optional. Enterprise web search tool type. Specialized retrieval
     tool that is powered by Vertex AI Search and Sec4 compliance. */
    enterpriseWebSearch?: EnterpriseWebSearch;
    /** Optional. Google Maps tool type. Specialized retrieval tool
     that is powered by Google Maps. */
    googleMaps?: GoogleMaps;
    /** Optional. CodeExecution tool type. Enables the model to execute code as part of generation. This field is only used by the Gemini Developer API services. */
    codeExecution?: ToolCodeExecution;
    /** Optional. Function tool type. One or more function declarations to be passed to the model along with the current user query. Model may decide to call a subset of these functions by populating FunctionCall in the response. User should provide a FunctionResponse for each function call in the next turn. Based on the function responses, Model will generate the final response back to the user. Maximum 128 function declarations can be provided. */
    functionDeclarations?: FunctionDeclaration[];
}

/** Tool that executes code generated by the model, and automatically returns the result to the model. See also [ExecutableCode]and [CodeExecutionResult] which are input and output to this tool. */
export declare interface ToolCodeExecution {
}

/** Tool config.

 This config is shared for all tools provided in the request.
 */
export declare interface ToolConfig {
    /** Optional. Function calling config. */
    functionCallingConfig?: FunctionCallingConfig;
    /** Optional. Retrieval config. */
    retrievalConfig?: RetrievalConfig;
}

export declare type ToolListUnion = Tool[];

/** Output only. Traffic type. This shows whether a request consumes Pay-As-You-Go or Provisioned Throughput quota. */
export declare enum TrafficType {
    TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED",
    ON_DEMAND = "ON_DEMAND",
    PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT"
}

/** Audio transcription in Server Conent. */
export declare interface Transcription {
    /** Transcription text.
     */
    text?: string;
    /** The bool indicates the end of the transcription.
     */
    finished?: boolean;
}

export declare interface TunedModel {
    /** Output only. The resource name of the TunedModel. Format: `projects/{project}/locations/{location}/models/{model}`. */
    model?: string;
    /** Output only. A resource name of an Endpoint. Format: `projects/{project}/locations/{location}/endpoints/{endpoint}`. */
    endpoint?: string;
}

/** A tuned machine learning model. */
export declare interface TunedModelInfo {
    /** ID of the base model that you want to tune. */
    baseModel?: string;
    /** Date and time when the base model was created. */
    createTime?: string;
    /** Date and time when the base model was last updated. */
    updateTime?: string;
}

/** Supervised fine-tuning training dataset. */
export declare interface TuningDataset {
    /** GCS URI of the file containing training dataset in JSONL format. */
    gcsUri?: string;
    /** Inline examples with simple input/output text. */
    examples?: TuningExample[];
}

/** The tuning data statistic values for TuningJob. */
export declare interface TuningDataStats {
    /** Output only. Statistics for distillation. */
    distillationDataStats?: DistillationDataStats;
    /** The SFT Tuning data stats. */
    supervisedTuningDataStats?: SupervisedTuningDataStats;
}

export declare interface TuningExample {
    /** Text model input. */
    textInput?: string;
    /** The expected model output. */
    output?: string;
}

/** A tuning job. */
export declare interface TuningJob {
    /** Output only. Identifier. Resource name of a TuningJob. Format: `projects/{project}/locations/{location}/tuningJobs/{tuning_job}` */
    name?: string;
    /** Output only. The detailed state of the job. */
    state?: JobState;
    /** Output only. Time when the TuningJob was created. */
    createTime?: string;
    /** Output only. Time when the TuningJob for the first time entered the `JOB_STATE_RUNNING` state. */
    startTime?: string;
    /** Output only. Time when the TuningJob entered any of the following JobStates: `JOB_STATE_SUCCEEDED`, `JOB_STATE_FAILED`, `JOB_STATE_CANCELLED`, `JOB_STATE_EXPIRED`. */
    endTime?: string;
    /** Output only. Time when the TuningJob was most recently updated. */
    updateTime?: string;
    /** Output only. Only populated when job's state is `JOB_STATE_FAILED` or `JOB_STATE_CANCELLED`. */
    error?: GoogleRpcStatus;
    /** Optional. The description of the TuningJob. */
    description?: string;
    /** The base model that is being tuned, e.g., "gemini-1.0-pro-002". . */
    baseModel?: string;
    /** Output only. The tuned model resources associated with this TuningJob. */
    tunedModel?: TunedModel;
    /** Tuning Spec for Supervised Fine Tuning. */
    supervisedTuningSpec?: SupervisedTuningSpec;
    /** Output only. The tuning data statistics associated with this TuningJob. */
    tuningDataStats?: TuningDataStats;
    /** Customer-managed encryption key options for a TuningJob. If this is set, then all resources created by the TuningJob will be encrypted with the provided encryption key. */
    encryptionSpec?: EncryptionSpec;
    /** Tuning Spec for open sourced and third party Partner models. */
    partnerModelTuningSpec?: PartnerModelTuningSpec;
    /** Tuning Spec for Distillation. */
    distillationSpec?: DistillationSpec;
    /** Output only. The Experiment associated with this TuningJob. */
    experiment?: string;
    /** Optional. The labels with user-defined metadata to organize TuningJob and generated resources such as Model and Endpoint. Label keys and values can be no longer than 64 characters (Unicode codepoints), can only contain lowercase letters, numeric characters, underscores and dashes. International characters are allowed. See https://goo.gl/xmQnxf for more information and examples of labels. */
    labels?: Record<string, string>;
    /** Output only. The resource name of the PipelineJob associated with the TuningJob. Format: `projects/{project}/locations/{location}/pipelineJobs/{pipeline_job}`. */
    pipelineJob?: string;
    /** Optional. The display name of the TunedModel. The name can be up to 128 characters long and can consist of any UTF-8 characters. */
    tunedModelDisplayName?: string;
}

declare class Tunings extends BaseModule {
    private readonly apiClient;
    constructor(apiClient: ApiClient);
    /**
     * Gets a TuningJob.
     *
     * @param name - The resource name of the tuning job.
     * @return - A TuningJob object.
     *
     * @experimental - The SDK's tuning implementation is experimental, and may
     * change in future versions.
     */
    get: (params: types.GetTuningJobParameters) => Promise<types.TuningJob>;
    /**
     * Lists tuning jobs.
     *
     * @param config - The configuration for the list request.
     * @return - A list of tuning jobs.
     *
     * @experimental - The SDK's tuning implementation is experimental, and may
     * change in future versions.
     */
    list: (params?: types.ListTuningJobsParameters) => Promise<Pager<types.TuningJob>>;
    /**
     * Creates a supervised fine-tuning job.
     *
     * @param params - The parameters for the tuning job.
     * @return - A TuningJob operation.
     *
     * @experimental - The SDK's tuning implementation is experimental, and may
     * change in future versions.
     */
    tune: (params: types.CreateTuningJobParameters) => Promise<types.TuningJob>;
    private getInternal;
    private listInternal;
    private tuneInternal;
    private tuneMldevInternal;
}

export declare interface TuningValidationDataset {
    /** GCS URI of the file containing validation dataset in JSONL format. */
    gcsUri?: string;
}

/** Options about which input is included in the user's turn. */
export declare enum TurnCoverage {
    TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED",
    TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY",
    TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT"
}

/** Optional. The type of the data. */
export declare enum Type {
    TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
    STRING = "STRING",
    NUMBER = "NUMBER",
    INTEGER = "INTEGER",
    BOOLEAN = "BOOLEAN",
    ARRAY = "ARRAY",
    OBJECT = "OBJECT"
}

declare namespace types {
    export {
        createPartFromUri,
        createPartFromText,
        createPartFromFunctionCall,
        createPartFromFunctionResponse,
        createPartFromBase64,
        createPartFromCodeExecutionResult,
        createPartFromExecutableCode,
        createUserContent,
        createModelContent,
        Outcome,
        Language,
        HarmCategory,
        HarmBlockMethod,
        HarmBlockThreshold,
        Mode,
        AuthType,
        Type,
        FinishReason,
        HarmProbability,
        HarmSeverity,
        BlockedReason,
        TrafficType,
        Modality,
        MediaResolution,
        JobState,
        AdapterSize,
        FeatureSelectionPreference,
        DynamicRetrievalConfigMode,
        FunctionCallingConfigMode,
        SafetyFilterLevel,
        PersonGeneration,
        ImagePromptLanguage,
        FileState,
        FileSource,
        MaskReferenceMode,
        ControlReferenceType,
        SubjectReferenceType,
        MediaModality,
        StartSensitivity,
        EndSensitivity,
        ActivityHandling,
        TurnCoverage,
        VideoMetadata,
        CodeExecutionResult,
        ExecutableCode,
        FileData,
        FunctionCall,
        FunctionResponse,
        Blob_2 as Blob,
        Part,
        Content,
        HttpOptions,
        ModelSelectionConfig,
        SafetySetting,
        GoogleSearch,
        DynamicRetrievalConfig,
        GoogleSearchRetrieval,
        EnterpriseWebSearch,
        ApiKeyConfig,
        AuthConfigGoogleServiceAccountConfig,
        AuthConfigHttpBasicAuthConfig,
        AuthConfigOauthConfig,
        AuthConfigOidcConfig,
        AuthConfig,
        GoogleMaps,
        VertexAISearch,
        VertexRagStoreRagResource,
        RagRetrievalConfigFilter,
        RagRetrievalConfigHybridSearch,
        RagRetrievalConfigRankingLlmRanker,
        RagRetrievalConfigRankingRankService,
        RagRetrievalConfigRanking,
        RagRetrievalConfig,
        VertexRagStore,
        Retrieval,
        ToolCodeExecution,
        Schema,
        FunctionDeclaration,
        Tool,
        FunctionCallingConfig,
        LatLng,
        RetrievalConfig,
        ToolConfig,
        PrebuiltVoiceConfig,
        VoiceConfig,
        SpeechConfig,
        ThinkingConfig,
        GenerationConfigRoutingConfigAutoRoutingMode,
        GenerationConfigRoutingConfigManualRoutingMode,
        GenerationConfigRoutingConfig,
        GenerateContentConfig,
        GenerateContentParameters,
        GoogleTypeDate,
        Citation,
        CitationMetadata,
        GroundingChunkRetrievedContext,
        GroundingChunkWeb,
        GroundingChunk,
        Segment,
        GroundingSupport,
        RetrievalMetadata,
        SearchEntryPoint,
        GroundingMetadata,
        LogprobsResultCandidate,
        LogprobsResultTopCandidates,
        LogprobsResult,
        SafetyRating,
        Candidate,
        GenerateContentResponsePromptFeedback,
        ModalityTokenCount,
        GenerateContentResponseUsageMetadata,
        GenerateContentResponse,
        EmbedContentConfig,
        EmbedContentParameters,
        ContentEmbeddingStatistics,
        ContentEmbedding,
        EmbedContentMetadata,
        EmbedContentResponse,
        GenerateImagesConfig,
        GenerateImagesParameters,
        Image_2 as Image,
        SafetyAttributes,
        GeneratedImage,
        GenerateImagesResponse,
        GetModelConfig,
        GetModelParameters,
        Endpoint,
        TunedModelInfo,
        Model,
        ListModelsConfig,
        ListModelsParameters,
        ListModelsResponse,
        UpdateModelConfig,
        UpdateModelParameters,
        DeleteModelConfig,
        DeleteModelParameters,
        DeleteModelResponse,
        GenerationConfig,
        CountTokensConfig,
        CountTokensParameters,
        CountTokensResponse,
        ComputeTokensConfig,
        ComputeTokensParameters,
        TokensInfo,
        ComputeTokensResponse,
        GenerateVideosConfig,
        GenerateVideosParameters,
        Video,
        GeneratedVideo,
        GenerateVideosResponse,
        GenerateVideosOperation,
        GetTuningJobConfig,
        GetTuningJobParameters,
        TunedModel,
        GoogleRpcStatus,
        SupervisedHyperParameters,
        SupervisedTuningSpec,
        DatasetDistributionDistributionBucket,
        DatasetDistribution,
        DatasetStats,
        DistillationDataStats,
        SupervisedTuningDatasetDistributionDatasetBucket,
        SupervisedTuningDatasetDistribution,
        SupervisedTuningDataStats,
        TuningDataStats,
        EncryptionSpec,
        PartnerModelTuningSpec,
        DistillationHyperParameters,
        DistillationSpec,
        TuningJob,
        ListTuningJobsConfig,
        ListTuningJobsParameters,
        ListTuningJobsResponse,
        TuningExample,
        TuningDataset,
        TuningValidationDataset,
        CreateTuningJobConfig,
        CreateTuningJobParameters,
        Operation,
        CreateCachedContentConfig,
        CreateCachedContentParameters,
        CachedContentUsageMetadata,
        CachedContent,
        GetCachedContentConfig,
        GetCachedContentParameters,
        DeleteCachedContentConfig,
        DeleteCachedContentParameters,
        DeleteCachedContentResponse,
        UpdateCachedContentConfig,
        UpdateCachedContentParameters,
        ListCachedContentsConfig,
        ListCachedContentsParameters,
        ListCachedContentsResponse,
        ListFilesConfig,
        ListFilesParameters,
        FileStatus,
        File_2 as File,
        ListFilesResponse,
        CreateFileConfig,
        CreateFileParameters,
        HttpResponse,
        LiveCallbacks,
        UploadFileParameters,
        CreateFileResponse,
        GetFileConfig,
        GetFileParameters,
        DeleteFileConfig,
        DeleteFileParameters,
        DeleteFileResponse,
        GetOperationConfig,
        GetOperationParameters,
        FetchPredictOperationConfig,
        FetchPredictOperationParameters,
        TestTableItem,
        TestTableFile,
        ReplayRequest,
        ReplayResponse,
        ReplayInteraction,
        ReplayFile,
        UploadFileConfig,
        DownloadFileConfig,
        DownloadFileParameters,
        UpscaleImageConfig,
        UpscaleImageParameters,
        RawReferenceImage,
        MaskReferenceConfig,
        MaskReferenceImage,
        ControlReferenceConfig,
        ControlReferenceImage,
        StyleReferenceConfig,
        StyleReferenceImage,
        SubjectReferenceConfig,
        SubjectReferenceImage,
        LiveServerSetupComplete,
        Transcription,
        LiveServerContent,
        LiveServerToolCall,
        LiveServerToolCallCancellation,
        UsageMetadata,
        LiveServerGoAway,
        LiveServerSessionResumptionUpdate,
        LiveServerMessage,
        AutomaticActivityDetection,
        RealtimeInputConfig,
        SessionResumptionConfig,
        SlidingWindow,
        ContextWindowCompressionConfig,
        AudioTranscriptionConfig,
        LiveClientSetup,
        LiveClientContent,
        ActivityStart,
        ActivityEnd,
        LiveClientRealtimeInput,
        LiveClientToolResponse,
        LiveClientMessage,
        LiveConnectConfig,
        LiveConnectParameters,
        CreateChatParameters,
        SendMessageParameters,
        LiveSendClientContentParameters,
        LiveSendRealtimeInputParameters,
        LiveSendToolResponseParameters,
        OperationGetParameters,
        BlobImageUnion,
        PartUnion,
        PartListUnion,
        ContentUnion,
        ContentListUnion,
        SchemaUnion,
        SpeechConfigUnion,
        ToolListUnion,
        DownloadableFileUnion
    }
}

/** Optional parameters for caches.update method. */
export declare interface UpdateCachedContentConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** The TTL for this resource. The expiration time is computed: now + TTL. It is a duration string, with up to nine fractional digits, terminated by 's'. Example: "3.5s". */
    ttl?: string;
    /** Timestamp of when this resource is considered expired. Uses RFC 3339 format, Example: 2014-10-02T15:01:23Z. */
    expireTime?: string;
}

export declare interface UpdateCachedContentParameters {
    /** The server-generated resource name of the cached content.
     */
    name: string;
    /** Configuration that contains optional parameters.
     */
    config?: UpdateCachedContentConfig;
}

/** Configuration for updating a tuned model. */
export declare interface UpdateModelConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    displayName?: string;
    description?: string;
}

/** Configuration for updating a tuned model. */
export declare interface UpdateModelParameters {
    model: string;
    config?: UpdateModelConfig;
}

declare interface Uploader {
    /**
     * Uploads a file to the given upload url.
     *
     * @param file The file to upload. file is in string type or a Blob.
     * @param uploadUrl The upload URL as a string is where the file will be
     *     uploaded to. The uploadUrl must be a url that was returned by the
     * https://generativelanguage.googleapis.com/upload/v1beta/files endpoint
     * @param apiClient The ApiClient to use for uploading.
     * @return A Promise that resolves to types.File.
     */
    upload(file: string | Blob, uploadUrl: string, apiClient: ApiClient): Promise<File_2>;
    /**
     * Returns the file's mimeType and the size of a given file. If the file is a
     * string path, the file type is determined by the file extension. If the
     * file's type cannot be determined, the type will be set to undefined.
     *
     * @param file The file to get the stat for. Can be a string path or a Blob.
     * @return A Promise that resolves to the file stat of the given file.
     */
    stat(file: string | Blob): Promise<FileStat>;
}

/** Used to override the default configuration. */
export declare interface UploadFileConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** The name of the file in the destination (e.g., 'files/sample-image'. If not provided one will be generated. */
    name?: string;
    /** mime_type: The MIME type of the file. If not provided, it will be inferred from the file extension. */
    mimeType?: string;
    /** Optional display name of the file. */
    displayName?: string;
}

/** Parameters for the upload file method. */
export declare interface UploadFileParameters {
    /** The string path to the file to be uploaded or a Blob object. */
    file: string | globalThis.Blob;
    /** Configuration that contains optional parameters. */
    config?: UploadFileConfig;
}

/** Configuration for upscaling an image.

 For more information on this configuration, refer to
 the `Imagen API reference documentation
 <https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api>`_.
 */
export declare interface UpscaleImageConfig {
    /** Used to override HTTP request options. */
    httpOptions?: HttpOptions;
    /** Abort signal which can be used to cancel the request.

     NOTE: AbortSignal is a client-only operation. Using it to cancel an
     operation will not cancel the request in the service. You will still
     be charged usage for any applicable operations.
     */
    abortSignal?: AbortSignal;
    /** Whether to include a reason for filtered-out images in the
     response. */
    includeRaiReason?: boolean;
    /** The image format that the output should be saved as. */
    outputMimeType?: string;
    /** The level of compression if the ``output_mime_type`` is
     ``image/jpeg``. */
    outputCompressionQuality?: number;
}

/** User-facing config UpscaleImageParameters. */
export declare interface UpscaleImageParameters {
    /** The model to use. */
    model: string;
    /** The input image to upscale. */
    image: Image_2;
    /** The factor to upscale the image (x2 or x4). */
    upscaleFactor: string;
    /** Configuration for upscaling. */
    config?: UpscaleImageConfig;
}

/** Usage metadata about response(s). */
export declare interface UsageMetadata {
    /** Number of tokens in the prompt. When `cached_content` is set, this is still the total effective prompt size meaning this includes the number of tokens in the cached content. */
    promptTokenCount?: number;
    /** Number of tokens in the cached part of the prompt (the cached content). */
    cachedContentTokenCount?: number;
    /** Total number of tokens across all the generated response candidates. */
    responseTokenCount?: number;
    /** Number of tokens present in tool-use prompt(s). */
    toolUsePromptTokenCount?: number;
    /** Number of tokens of thoughts for thinking models. */
    thoughtsTokenCount?: number;
    /** Total token count for prompt, response candidates, and tool-use prompts(if present). */
    totalTokenCount?: number;
    /** List of modalities that were processed in the request input. */
    promptTokensDetails?: ModalityTokenCount[];
    /** List of modalities that were processed in the cache input. */
    cacheTokensDetails?: ModalityTokenCount[];
    /** List of modalities that were returned in the response. */
    responseTokensDetails?: ModalityTokenCount[];
    /** List of modalities that were processed in the tool-use prompt. */
    toolUsePromptTokensDetails?: ModalityTokenCount[];
    /** Traffic type. This shows whether a request consumes Pay-As-You-Go
     or Provisioned Throughput quota. */
    trafficType?: TrafficType;
}

/** Retrieve from Vertex AI Search datastore or engine for grounding. datastore and engine are mutually exclusive. See https://cloud.google.com/products/agent-builder */
export declare interface VertexAISearch {
    /** Optional. Fully-qualified Vertex AI Search data store resource ID. Format: `projects/{project}/locations/{location}/collections/{collection}/dataStores/{dataStore}` */
    datastore?: string;
    /** Optional. Fully-qualified Vertex AI Search engine resource ID. Format: `projects/{project}/locations/{location}/collections/{collection}/engines/{engine}` */
    engine?: string;
}

/** Retrieve from Vertex RAG Store for grounding. */
export declare interface VertexRagStore {
    /** Optional. Deprecated. Please use rag_resources instead. */
    ragCorpora?: string[];
    /** Optional. The representation of the rag source. It can be used to specify corpus only or ragfiles. Currently only support one corpus or multiple files from one corpus. In the future we may open up multiple corpora support. */
    ragResources?: VertexRagStoreRagResource[];
    /** Optional. The retrieval config for the Rag query. */
    ragRetrievalConfig?: RagRetrievalConfig;
    /** Optional. Number of top k results to return from the selected corpora. */
    similarityTopK?: number;
    /** Optional. Only return results with vector distance smaller than the threshold. */
    vectorDistanceThreshold?: number;
}

/** The definition of the Rag resource. */
export declare interface VertexRagStoreRagResource {
    /** Optional. RagCorpora resource name. Format: `projects/{project}/locations/{location}/ragCorpora/{rag_corpus}` */
    ragCorpus?: string;
    /** Optional. rag_file_id. The files should be in the same rag_corpus set in rag_corpus field. */
    ragFileIds?: string[];
}

/** A generated video. */
export declare interface Video {
    /** Path to another storage. */
    uri?: string;
    /** Video bytes. */
    videoBytes?: string;
    /** Video encoding, for example "video/mp4". */
    mimeType?: string;
}

/** Metadata describes the input video content. */
export declare interface VideoMetadata {
    /** Optional. The end offset of the video. */
    endOffset?: string;
    /** Optional. The start offset of the video. */
    startOffset?: string;
}

/** The configuration for the voice to use. */
export declare interface VoiceConfig {
    /** The configuration for the speaker to use.
     */
    prebuiltVoiceConfig?: PrebuiltVoiceConfig;
}

declare interface WebSocket_2 {
    /**
     * Connects the socket to the server.
     */
    connect(): void;
    /**
     * Sends a message to the server.
     */
    send(message: string): void;
    /**
     * Closes the socket connection.
     */
    close(): void;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
declare interface WebSocketCallbacks {
    onopen: () => void;
    onerror: (e: any) => void;
    onmessage: (e: any) => void;
    onclose: (e: any) => void;
}

declare interface WebSocketFactory {
    /**
     * Returns a new WebSocket instance.
     */
    create(url: string, headers: Record<string, string>, callbacks: WebSocketCallbacks): WebSocket_2;
}

export { }
