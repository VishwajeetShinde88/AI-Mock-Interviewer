/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let _defaultBaseGeminiUrl = undefined;
let _defaultBaseVertexUrl = undefined;
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
function setDefaultBaseUrls(baseUrlParams) {
    _defaultBaseGeminiUrl = baseUrlParams.geminiUrl;
    _defaultBaseVertexUrl = baseUrlParams.vertexUrl;
}
/**
 * Returns the default base URLs for the Gemini API and Vertex AI API.
 */
function getDefaultBaseUrls() {
    return {
        geminiUrl: _defaultBaseGeminiUrl,
        vertexUrl: _defaultBaseVertexUrl,
    };
}
/**
 * Returns the default base URL based on the following priority:
 *   1. Base URLs set via HttpOptions.
 *   2. Base URLs set via the latest call to setDefaultBaseUrls.
 *   3. Base URLs set via environment variables.
 */
function getBaseUrl(options, vertexBaseUrlFromEnv, geminiBaseUrlFromEnv) {
    var _a, _b, _c;
    if (!((_a = options.httpOptions) === null || _a === void 0 ? void 0 : _a.baseUrl)) {
        const defaultBaseUrls = getDefaultBaseUrls();
        if (options.vertexai) {
            return (_b = defaultBaseUrls.vertexUrl) !== null && _b !== void 0 ? _b : vertexBaseUrlFromEnv;
        }
        else {
            return (_c = defaultBaseUrls.geminiUrl) !== null && _c !== void 0 ? _c : geminiBaseUrlFromEnv;
        }
    }
    return options.httpOptions.baseUrl;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class BaseModule {
}
function formatMap(templateString, valueMap) {
    // Use a regular expression to find all placeholders in the template string
    const regex = /\{([^}]+)\}/g;
    // Replace each placeholder with its corresponding value from the valueMap
    return templateString.replace(regex, (match, key) => {
        if (Object.prototype.hasOwnProperty.call(valueMap, key)) {
            const value = valueMap[key];
            // Convert the value to a string if it's not a string already
            return value !== undefined && value !== null ? String(value) : '';
        }
        else {
            // Handle missing keys
            throw new Error(`Key '${key}' not found in valueMap.`);
        }
    });
}
function setValueByPath(data, keys, value) {
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key.endsWith('[]')) {
            const keyName = key.slice(0, -2);
            if (!(keyName in data)) {
                if (Array.isArray(value)) {
                    data[keyName] = Array.from({ length: value.length }, () => ({}));
                }
                else {
                    throw new Error(`Value must be a list given an array path ${key}`);
                }
            }
            if (Array.isArray(data[keyName])) {
                const arrayData = data[keyName];
                if (Array.isArray(value)) {
                    for (let j = 0; j < arrayData.length; j++) {
                        const entry = arrayData[j];
                        setValueByPath(entry, keys.slice(i + 1), value[j]);
                    }
                }
                else {
                    for (const d of arrayData) {
                        setValueByPath(d, keys.slice(i + 1), value);
                    }
                }
            }
            return;
        }
        else if (key.endsWith('[0]')) {
            const keyName = key.slice(0, -3);
            if (!(keyName in data)) {
                data[keyName] = [{}];
            }
            const arrayData = data[keyName];
            setValueByPath(arrayData[0], keys.slice(i + 1), value);
            return;
        }
        if (!data[key] || typeof data[key] !== 'object') {
            data[key] = {};
        }
        data = data[key];
    }
    const keyToSet = keys[keys.length - 1];
    const existingData = data[keyToSet];
    if (existingData !== undefined) {
        if (!value ||
            (typeof value === 'object' && Object.keys(value).length === 0)) {
            return;
        }
        if (value === existingData) {
            return;
        }
        if (typeof existingData === 'object' &&
            typeof value === 'object' &&
            existingData !== null &&
            value !== null) {
            Object.assign(existingData, value);
        }
        else {
            throw new Error(`Cannot set value for an existing key. Key: ${keyToSet}`);
        }
    }
    else {
        data[keyToSet] = value;
    }
}
function getValueByPath(data, keys) {
    try {
        if (keys.length === 1 && keys[0] === '_self') {
            return data;
        }
        for (let i = 0; i < keys.length; i++) {
            if (typeof data !== 'object' || data === null) {
                return undefined;
            }
            const key = keys[i];
            if (key.endsWith('[]')) {
                const keyName = key.slice(0, -2);
                if (keyName in data) {
                    const arrayData = data[keyName];
                    if (!Array.isArray(arrayData)) {
                        return undefined;
                    }
                    return arrayData.map((d) => getValueByPath(d, keys.slice(i + 1)));
                }
                else {
                    return undefined;
                }
            }
            else {
                data = data[key];
            }
        }
        return data;
    }
    catch (error) {
        if (error instanceof TypeError) {
            return undefined;
        }
        throw error;
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function tModel(apiClient, model) {
    if (!model || typeof model !== 'string') {
        throw new Error('model is required and must be a string');
    }
    if (apiClient.isVertexAI()) {
        if (model.startsWith('publishers/') ||
            model.startsWith('projects/') ||
            model.startsWith('models/')) {
            return model;
        }
        else if (model.indexOf('/') >= 0) {
            const parts = model.split('/', 2);
            return `publishers/${parts[0]}/models/${parts[1]}`;
        }
        else {
            return `publishers/google/models/${model}`;
        }
    }
    else {
        if (model.startsWith('models/') || model.startsWith('tunedModels/')) {
            return model;
        }
        else {
            return `models/${model}`;
        }
    }
}
function tCachesModel(apiClient, model) {
    const transformedModel = tModel(apiClient, model);
    if (!transformedModel) {
        return '';
    }
    if (transformedModel.startsWith('publishers/') && apiClient.isVertexAI()) {
        // vertex caches only support model name start with projects.
        return `projects/${apiClient.getProject()}/locations/${apiClient.getLocation()}/${transformedModel}`;
    }
    else if (transformedModel.startsWith('models/') && apiClient.isVertexAI()) {
        return `projects/${apiClient.getProject()}/locations/${apiClient.getLocation()}/publishers/google/${transformedModel}`;
    }
    else {
        return transformedModel;
    }
}
function tBlobs(apiClient, blobs) {
    if (Array.isArray(blobs)) {
        return blobs.map((blob) => tBlob(apiClient, blob));
    }
    else {
        return [tBlob(apiClient, blobs)];
    }
}
function tBlob(apiClient, blob) {
    if (typeof blob === 'object' && blob !== null) {
        return blob;
    }
    throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof blob}`);
}
function tImageBlob(apiClient, blob) {
    const transformedBlob = tBlob(apiClient, blob);
    if (transformedBlob.mimeType &&
        transformedBlob.mimeType.startsWith('image/')) {
        return transformedBlob;
    }
    throw new Error(`Unsupported mime type: ${transformedBlob.mimeType}`);
}
function tAudioBlob(apiClient, blob) {
    const transformedBlob = tBlob(apiClient, blob);
    if (transformedBlob.mimeType &&
        transformedBlob.mimeType.startsWith('audio/')) {
        return transformedBlob;
    }
    throw new Error(`Unsupported mime type: ${transformedBlob.mimeType}`);
}
function tPart(apiClient, origin) {
    if (origin === null || origin === undefined) {
        throw new Error('PartUnion is required');
    }
    if (typeof origin === 'object') {
        return origin;
    }
    if (typeof origin === 'string') {
        return { text: origin };
    }
    throw new Error(`Unsupported part type: ${typeof origin}`);
}
function tParts(apiClient, origin) {
    if (origin === null ||
        origin === undefined ||
        (Array.isArray(origin) && origin.length === 0)) {
        throw new Error('PartListUnion is required');
    }
    if (Array.isArray(origin)) {
        return origin.map((item) => tPart(apiClient, item));
    }
    return [tPart(apiClient, origin)];
}
function _isContent(origin) {
    return (origin !== null &&
        origin !== undefined &&
        typeof origin === 'object' &&
        'parts' in origin &&
        Array.isArray(origin.parts));
}
function _isFunctionCallPart(origin) {
    return (origin !== null &&
        origin !== undefined &&
        typeof origin === 'object' &&
        'functionCall' in origin);
}
function _isFunctionResponsePart(origin) {
    return (origin !== null &&
        origin !== undefined &&
        typeof origin === 'object' &&
        'functionResponse' in origin);
}
function tContent(apiClient, origin) {
    if (origin === null || origin === undefined) {
        throw new Error('ContentUnion is required');
    }
    if (_isContent(origin)) {
        // _isContent is a utility function that checks if the
        // origin is a Content.
        return origin;
    }
    return {
        role: 'user',
        parts: tParts(apiClient, origin),
    };
}
function tContentsForEmbed(apiClient, origin) {
    if (!origin) {
        return [];
    }
    if (apiClient.isVertexAI() && Array.isArray(origin)) {
        return origin.flatMap((item) => {
            const content = tContent(apiClient, item);
            if (content.parts &&
                content.parts.length > 0 &&
                content.parts[0].text !== undefined) {
                return [content.parts[0].text];
            }
            return [];
        });
    }
    else if (apiClient.isVertexAI()) {
        const content = tContent(apiClient, origin);
        if (content.parts &&
            content.parts.length > 0 &&
            content.parts[0].text !== undefined) {
            return [content.parts[0].text];
        }
        return [];
    }
    if (Array.isArray(origin)) {
        return origin.map((item) => tContent(apiClient, item));
    }
    return [tContent(apiClient, origin)];
}
function tContents(apiClient, origin) {
    if (origin === null ||
        origin === undefined ||
        (Array.isArray(origin) && origin.length === 0)) {
        throw new Error('contents are required');
    }
    if (!Array.isArray(origin)) {
        // If it's not an array, it's a single content or a single PartUnion.
        if (_isFunctionCallPart(origin) || _isFunctionResponsePart(origin)) {
            throw new Error('To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them');
        }
        return [tContent(apiClient, origin)];
    }
    const result = [];
    const accumulatedParts = [];
    const isContentArray = _isContent(origin[0]);
    for (const item of origin) {
        const isContent = _isContent(item);
        if (isContent != isContentArray) {
            throw new Error('Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them');
        }
        if (isContent) {
            // `isContent` contains the result of _isContent, which is a utility
            // function that checks if the item is a Content.
            result.push(item);
        }
        else if (_isFunctionCallPart(item) || _isFunctionResponsePart(item)) {
            throw new Error('To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them');
        }
        else {
            accumulatedParts.push(item);
        }
    }
    if (!isContentArray) {
        result.push({ role: 'user', parts: tParts(apiClient, accumulatedParts) });
    }
    return result;
}
function tSchema(apiClient, schema) {
    return schema;
}
function tSpeechConfig(apiClient, speechConfig) {
    if (typeof speechConfig === 'object') {
        return speechConfig;
    }
    else if (typeof speechConfig === 'string') {
        return {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: speechConfig,
                },
            },
        };
    }
    else {
        throw new Error(`Unsupported speechConfig type: ${typeof speechConfig}`);
    }
}
function tTool(apiClient, tool) {
    return tool;
}
function tTools(apiClient, tool) {
    if (!Array.isArray(tool)) {
        throw new Error('tool is required and must be an array of Tools');
    }
    return tool;
}
/**
 * Prepends resource name with project, location, resource_prefix if needed.
 *
 * @param client The API client.
 * @param resourceName The resource name.
 * @param resourcePrefix The resource prefix.
 * @param splitsAfterPrefix The number of splits after the prefix.
 * @returns The completed resource name.
 *
 * Examples:
 *
 * ```
 * resource_name = '123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = True
 * client.project = 'bar'
 * client.location = 'us-west1'
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * returns: 'projects/bar/locations/us-west1/cachedContents/123'
 * ```
 *
 * ```
 * resource_name = 'projects/foo/locations/us-central1/cachedContents/123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = True
 * client.project = 'bar'
 * client.location = 'us-west1'
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * returns: 'projects/foo/locations/us-central1/cachedContents/123'
 * ```
 *
 * ```
 * resource_name = '123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = False
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * returns 'cachedContents/123'
 * ```
 *
 * ```
 * resource_name = 'some/wrong/cachedContents/resource/name/123'
 * resource_prefix = 'cachedContents'
 * splits_after_prefix = 1
 * client.vertexai = False
 * # client.vertexai = True
 * _resource_name(client, resource_name, resource_prefix, splits_after_prefix)
 * -> 'some/wrong/resource/name/123'
 * ```
 */
function resourceName(client, resourceName, resourcePrefix, splitsAfterPrefix = 1) {
    const shouldAppendPrefix = !resourceName.startsWith(`${resourcePrefix}/`) &&
        resourceName.split('/').length === splitsAfterPrefix;
    if (client.isVertexAI()) {
        if (resourceName.startsWith('projects/')) {
            return resourceName;
        }
        else if (resourceName.startsWith('locations/')) {
            return `projects/${client.getProject()}/${resourceName}`;
        }
        else if (resourceName.startsWith(`${resourcePrefix}/`)) {
            return `projects/${client.getProject()}/locations/${client.getLocation()}/${resourceName}`;
        }
        else if (shouldAppendPrefix) {
            return `projects/${client.getProject()}/locations/${client.getLocation()}/${resourcePrefix}/${resourceName}`;
        }
        else {
            return resourceName;
        }
    }
    if (shouldAppendPrefix) {
        return `${resourcePrefix}/${resourceName}`;
    }
    return resourceName;
}
function tCachedContentName(apiClient, name) {
    if (typeof name !== 'string') {
        throw new Error('name must be a string');
    }
    return resourceName(apiClient, name, 'cachedContents');
}
function tTuningJobStatus(apiClient, status) {
    switch (status) {
        case 'STATE_UNSPECIFIED':
            return 'JOB_STATE_UNSPECIFIED';
        case 'CREATING':
            return 'JOB_STATE_RUNNING';
        case 'ACTIVE':
            return 'JOB_STATE_SUCCEEDED';
        case 'FAILED':
            return 'JOB_STATE_FAILED';
        default:
            return status;
    }
}
function tBytes(apiClient, fromImageBytes) {
    if (typeof fromImageBytes !== 'string') {
        throw new Error('fromImageBytes must be a string');
    }
    // TODO(b/389133914): Remove dummy bytes converter.
    return fromImageBytes;
}
function _isFile(origin) {
    return (origin !== null &&
        origin !== undefined &&
        typeof origin === 'object' &&
        'name' in origin);
}
function isGeneratedVideo(origin) {
    return (origin !== null &&
        origin !== undefined &&
        typeof origin === 'object' &&
        'video' in origin);
}
function isVideo(origin) {
    return (origin !== null &&
        origin !== undefined &&
        typeof origin === 'object' &&
        'uri' in origin);
}
function tFileName(apiClient, fromName) {
    var _a;
    let name;
    if (_isFile(fromName)) {
        name = fromName.name;
    }
    if (isVideo(fromName)) {
        name = fromName.uri;
        if (name === undefined) {
            return undefined;
        }
    }
    if (isGeneratedVideo(fromName)) {
        name = (_a = fromName.video) === null || _a === void 0 ? void 0 : _a.uri;
        if (name === undefined) {
            return undefined;
        }
    }
    if (typeof fromName === 'string') {
        name = fromName;
    }
    if (name === undefined) {
        throw new Error('Could not extract file name from the provided input.');
    }
    if (name.startsWith('https://')) {
        const suffix = name.split('files/')[1];
        const match = suffix.match(/[a-z0-9]+/);
        if (match === null) {
            throw new Error(`Could not extract file name from URI ${name}`);
        }
        name = match[0];
    }
    else if (name.startsWith('files/')) {
        name = name.split('files/')[1];
    }
    return name;
}
function tModelsUrl(apiClient, baseModels) {
    let res;
    if (apiClient.isVertexAI()) {
        res = baseModels ? 'publishers/google/models' : 'models';
    }
    else {
        res = baseModels ? 'models' : 'tunedModels';
    }
    return res;
}
function tExtractModels(apiClient, response) {
    for (const key of ['models', 'tunedModels', 'publisherModels']) {
        if (hasField(response, key)) {
            return response[key];
        }
    }
    return [];
}
function hasField(data, fieldName) {
    return data !== null && typeof data === 'object' && fieldName in data;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function partToMldev$2(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['videoMetadata']) !== undefined) {
        throw new Error('videoMetadata parameter is not supported in Gemini API.');
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentToMldev$2(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partToMldev$2(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function googleSearchToMldev$2() {
    const toObject = {};
    return toObject;
}
function dynamicRetrievalConfigToMldev$2(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromDynamicThreshold = getValueByPath(fromObject, [
        'dynamicThreshold',
    ]);
    if (fromDynamicThreshold != null) {
        setValueByPath(toObject, ['dynamicThreshold'], fromDynamicThreshold);
    }
    return toObject;
}
function googleSearchRetrievalToMldev$2(apiClient, fromObject) {
    const toObject = {};
    const fromDynamicRetrievalConfig = getValueByPath(fromObject, [
        'dynamicRetrievalConfig',
    ]);
    if (fromDynamicRetrievalConfig != null) {
        setValueByPath(toObject, ['dynamicRetrievalConfig'], dynamicRetrievalConfigToMldev$2(apiClient, fromDynamicRetrievalConfig));
    }
    return toObject;
}
function toolToMldev$2(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['retrieval']) !== undefined) {
        throw new Error('retrieval parameter is not supported in Gemini API.');
    }
    const fromGoogleSearch = getValueByPath(fromObject, ['googleSearch']);
    if (fromGoogleSearch != null) {
        setValueByPath(toObject, ['googleSearch'], googleSearchToMldev$2());
    }
    const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
        'googleSearchRetrieval',
    ]);
    if (fromGoogleSearchRetrieval != null) {
        setValueByPath(toObject, ['googleSearchRetrieval'], googleSearchRetrievalToMldev$2(apiClient, fromGoogleSearchRetrieval));
    }
    if (getValueByPath(fromObject, ['enterpriseWebSearch']) !== undefined) {
        throw new Error('enterpriseWebSearch parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['googleMaps']) !== undefined) {
        throw new Error('googleMaps parameter is not supported in Gemini API.');
    }
    const fromCodeExecution = getValueByPath(fromObject, [
        'codeExecution',
    ]);
    if (fromCodeExecution != null) {
        setValueByPath(toObject, ['codeExecution'], fromCodeExecution);
    }
    const fromFunctionDeclarations = getValueByPath(fromObject, [
        'functionDeclarations',
    ]);
    if (fromFunctionDeclarations != null) {
        setValueByPath(toObject, ['functionDeclarations'], fromFunctionDeclarations);
    }
    return toObject;
}
function functionCallingConfigToMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromAllowedFunctionNames = getValueByPath(fromObject, [
        'allowedFunctionNames',
    ]);
    if (fromAllowedFunctionNames != null) {
        setValueByPath(toObject, ['allowedFunctionNames'], fromAllowedFunctionNames);
    }
    return toObject;
}
function toolConfigToMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromFunctionCallingConfig = getValueByPath(fromObject, [
        'functionCallingConfig',
    ]);
    if (fromFunctionCallingConfig != null) {
        setValueByPath(toObject, ['functionCallingConfig'], functionCallingConfigToMldev$1(apiClient, fromFunctionCallingConfig));
    }
    if (getValueByPath(fromObject, ['retrievalConfig']) !== undefined) {
        throw new Error('retrievalConfig parameter is not supported in Gemini API.');
    }
    return toObject;
}
function createCachedContentConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromTtl = getValueByPath(fromObject, ['ttl']);
    if (parentObject !== undefined && fromTtl != null) {
        setValueByPath(parentObject, ['ttl'], fromTtl);
    }
    const fromExpireTime = getValueByPath(fromObject, ['expireTime']);
    if (parentObject !== undefined && fromExpireTime != null) {
        setValueByPath(parentObject, ['expireTime'], fromExpireTime);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (parentObject !== undefined && fromDisplayName != null) {
        setValueByPath(parentObject, ['displayName'], fromDisplayName);
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (parentObject !== undefined && fromContents != null) {
        let transformedList = tContents(apiClient, fromContents);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentToMldev$2(apiClient, item);
            });
        }
        setValueByPath(parentObject, ['contents'], transformedList);
    }
    const fromSystemInstruction = getValueByPath(fromObject, [
        'systemInstruction',
    ]);
    if (parentObject !== undefined && fromSystemInstruction != null) {
        setValueByPath(parentObject, ['systemInstruction'], contentToMldev$2(apiClient, tContent(apiClient, fromSystemInstruction)));
    }
    const fromTools = getValueByPath(fromObject, ['tools']);
    if (parentObject !== undefined && fromTools != null) {
        let transformedList = fromTools;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return toolToMldev$2(apiClient, item);
            });
        }
        setValueByPath(parentObject, ['tools'], transformedList);
    }
    const fromToolConfig = getValueByPath(fromObject, ['toolConfig']);
    if (parentObject !== undefined && fromToolConfig != null) {
        setValueByPath(parentObject, ['toolConfig'], toolConfigToMldev$1(apiClient, fromToolConfig));
    }
    return toObject;
}
function createCachedContentParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['model'], tCachesModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], createCachedContentConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function getCachedContentParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], tCachedContentName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function deleteCachedContentParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], tCachedContentName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function updateCachedContentConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromTtl = getValueByPath(fromObject, ['ttl']);
    if (parentObject !== undefined && fromTtl != null) {
        setValueByPath(parentObject, ['ttl'], fromTtl);
    }
    const fromExpireTime = getValueByPath(fromObject, ['expireTime']);
    if (parentObject !== undefined && fromExpireTime != null) {
        setValueByPath(parentObject, ['expireTime'], fromExpireTime);
    }
    return toObject;
}
function updateCachedContentParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], tCachedContentName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], updateCachedContentConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function listCachedContentsConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromPageSize = getValueByPath(fromObject, ['pageSize']);
    if (parentObject !== undefined && fromPageSize != null) {
        setValueByPath(parentObject, ['_query', 'pageSize'], fromPageSize);
    }
    const fromPageToken = getValueByPath(fromObject, ['pageToken']);
    if (parentObject !== undefined && fromPageToken != null) {
        setValueByPath(parentObject, ['_query', 'pageToken'], fromPageToken);
    }
    return toObject;
}
function listCachedContentsParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], listCachedContentsConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function partToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromVideoMetadata = getValueByPath(fromObject, [
        'videoMetadata',
    ]);
    if (fromVideoMetadata != null) {
        setValueByPath(toObject, ['videoMetadata'], fromVideoMetadata);
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partToVertex$2(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function googleSearchToVertex$2() {
    const toObject = {};
    return toObject;
}
function dynamicRetrievalConfigToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromDynamicThreshold = getValueByPath(fromObject, [
        'dynamicThreshold',
    ]);
    if (fromDynamicThreshold != null) {
        setValueByPath(toObject, ['dynamicThreshold'], fromDynamicThreshold);
    }
    return toObject;
}
function googleSearchRetrievalToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromDynamicRetrievalConfig = getValueByPath(fromObject, [
        'dynamicRetrievalConfig',
    ]);
    if (fromDynamicRetrievalConfig != null) {
        setValueByPath(toObject, ['dynamicRetrievalConfig'], dynamicRetrievalConfigToVertex$2(apiClient, fromDynamicRetrievalConfig));
    }
    return toObject;
}
function enterpriseWebSearchToVertex$2() {
    const toObject = {};
    return toObject;
}
function apiKeyConfigToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromApiKeyString = getValueByPath(fromObject, ['apiKeyString']);
    if (fromApiKeyString != null) {
        setValueByPath(toObject, ['apiKeyString'], fromApiKeyString);
    }
    return toObject;
}
function authConfigToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromApiKeyConfig = getValueByPath(fromObject, ['apiKeyConfig']);
    if (fromApiKeyConfig != null) {
        setValueByPath(toObject, ['apiKeyConfig'], apiKeyConfigToVertex$2(apiClient, fromApiKeyConfig));
    }
    const fromAuthType = getValueByPath(fromObject, ['authType']);
    if (fromAuthType != null) {
        setValueByPath(toObject, ['authType'], fromAuthType);
    }
    const fromGoogleServiceAccountConfig = getValueByPath(fromObject, [
        'googleServiceAccountConfig',
    ]);
    if (fromGoogleServiceAccountConfig != null) {
        setValueByPath(toObject, ['googleServiceAccountConfig'], fromGoogleServiceAccountConfig);
    }
    const fromHttpBasicAuthConfig = getValueByPath(fromObject, [
        'httpBasicAuthConfig',
    ]);
    if (fromHttpBasicAuthConfig != null) {
        setValueByPath(toObject, ['httpBasicAuthConfig'], fromHttpBasicAuthConfig);
    }
    const fromOauthConfig = getValueByPath(fromObject, ['oauthConfig']);
    if (fromOauthConfig != null) {
        setValueByPath(toObject, ['oauthConfig'], fromOauthConfig);
    }
    const fromOidcConfig = getValueByPath(fromObject, ['oidcConfig']);
    if (fromOidcConfig != null) {
        setValueByPath(toObject, ['oidcConfig'], fromOidcConfig);
    }
    return toObject;
}
function googleMapsToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromAuthConfig = getValueByPath(fromObject, ['authConfig']);
    if (fromAuthConfig != null) {
        setValueByPath(toObject, ['authConfig'], authConfigToVertex$2(apiClient, fromAuthConfig));
    }
    return toObject;
}
function toolToVertex$2(apiClient, fromObject) {
    const toObject = {};
    const fromRetrieval = getValueByPath(fromObject, ['retrieval']);
    if (fromRetrieval != null) {
        setValueByPath(toObject, ['retrieval'], fromRetrieval);
    }
    const fromGoogleSearch = getValueByPath(fromObject, ['googleSearch']);
    if (fromGoogleSearch != null) {
        setValueByPath(toObject, ['googleSearch'], googleSearchToVertex$2());
    }
    const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
        'googleSearchRetrieval',
    ]);
    if (fromGoogleSearchRetrieval != null) {
        setValueByPath(toObject, ['googleSearchRetrieval'], googleSearchRetrievalToVertex$2(apiClient, fromGoogleSearchRetrieval));
    }
    const fromEnterpriseWebSearch = getValueByPath(fromObject, [
        'enterpriseWebSearch',
    ]);
    if (fromEnterpriseWebSearch != null) {
        setValueByPath(toObject, ['enterpriseWebSearch'], enterpriseWebSearchToVertex$2());
    }
    const fromGoogleMaps = getValueByPath(fromObject, ['googleMaps']);
    if (fromGoogleMaps != null) {
        setValueByPath(toObject, ['googleMaps'], googleMapsToVertex$2(apiClient, fromGoogleMaps));
    }
    const fromCodeExecution = getValueByPath(fromObject, [
        'codeExecution',
    ]);
    if (fromCodeExecution != null) {
        setValueByPath(toObject, ['codeExecution'], fromCodeExecution);
    }
    const fromFunctionDeclarations = getValueByPath(fromObject, [
        'functionDeclarations',
    ]);
    if (fromFunctionDeclarations != null) {
        setValueByPath(toObject, ['functionDeclarations'], fromFunctionDeclarations);
    }
    return toObject;
}
function functionCallingConfigToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromAllowedFunctionNames = getValueByPath(fromObject, [
        'allowedFunctionNames',
    ]);
    if (fromAllowedFunctionNames != null) {
        setValueByPath(toObject, ['allowedFunctionNames'], fromAllowedFunctionNames);
    }
    return toObject;
}
function latLngToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromLatitude = getValueByPath(fromObject, ['latitude']);
    if (fromLatitude != null) {
        setValueByPath(toObject, ['latitude'], fromLatitude);
    }
    const fromLongitude = getValueByPath(fromObject, ['longitude']);
    if (fromLongitude != null) {
        setValueByPath(toObject, ['longitude'], fromLongitude);
    }
    return toObject;
}
function retrievalConfigToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromLatLng = getValueByPath(fromObject, ['latLng']);
    if (fromLatLng != null) {
        setValueByPath(toObject, ['latLng'], latLngToVertex$1(apiClient, fromLatLng));
    }
    return toObject;
}
function toolConfigToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromFunctionCallingConfig = getValueByPath(fromObject, [
        'functionCallingConfig',
    ]);
    if (fromFunctionCallingConfig != null) {
        setValueByPath(toObject, ['functionCallingConfig'], functionCallingConfigToVertex$1(apiClient, fromFunctionCallingConfig));
    }
    const fromRetrievalConfig = getValueByPath(fromObject, [
        'retrievalConfig',
    ]);
    if (fromRetrievalConfig != null) {
        setValueByPath(toObject, ['retrievalConfig'], retrievalConfigToVertex$1(apiClient, fromRetrievalConfig));
    }
    return toObject;
}
function createCachedContentConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromTtl = getValueByPath(fromObject, ['ttl']);
    if (parentObject !== undefined && fromTtl != null) {
        setValueByPath(parentObject, ['ttl'], fromTtl);
    }
    const fromExpireTime = getValueByPath(fromObject, ['expireTime']);
    if (parentObject !== undefined && fromExpireTime != null) {
        setValueByPath(parentObject, ['expireTime'], fromExpireTime);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (parentObject !== undefined && fromDisplayName != null) {
        setValueByPath(parentObject, ['displayName'], fromDisplayName);
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (parentObject !== undefined && fromContents != null) {
        let transformedList = tContents(apiClient, fromContents);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentToVertex$2(apiClient, item);
            });
        }
        setValueByPath(parentObject, ['contents'], transformedList);
    }
    const fromSystemInstruction = getValueByPath(fromObject, [
        'systemInstruction',
    ]);
    if (parentObject !== undefined && fromSystemInstruction != null) {
        setValueByPath(parentObject, ['systemInstruction'], contentToVertex$2(apiClient, tContent(apiClient, fromSystemInstruction)));
    }
    const fromTools = getValueByPath(fromObject, ['tools']);
    if (parentObject !== undefined && fromTools != null) {
        let transformedList = fromTools;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return toolToVertex$2(apiClient, item);
            });
        }
        setValueByPath(parentObject, ['tools'], transformedList);
    }
    const fromToolConfig = getValueByPath(fromObject, ['toolConfig']);
    if (parentObject !== undefined && fromToolConfig != null) {
        setValueByPath(parentObject, ['toolConfig'], toolConfigToVertex$1(apiClient, fromToolConfig));
    }
    return toObject;
}
function createCachedContentParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['model'], tCachesModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], createCachedContentConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function getCachedContentParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], tCachedContentName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function deleteCachedContentParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], tCachedContentName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function updateCachedContentConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromTtl = getValueByPath(fromObject, ['ttl']);
    if (parentObject !== undefined && fromTtl != null) {
        setValueByPath(parentObject, ['ttl'], fromTtl);
    }
    const fromExpireTime = getValueByPath(fromObject, ['expireTime']);
    if (parentObject !== undefined && fromExpireTime != null) {
        setValueByPath(parentObject, ['expireTime'], fromExpireTime);
    }
    return toObject;
}
function updateCachedContentParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], tCachedContentName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], updateCachedContentConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function listCachedContentsConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromPageSize = getValueByPath(fromObject, ['pageSize']);
    if (parentObject !== undefined && fromPageSize != null) {
        setValueByPath(parentObject, ['_query', 'pageSize'], fromPageSize);
    }
    const fromPageToken = getValueByPath(fromObject, ['pageToken']);
    if (parentObject !== undefined && fromPageToken != null) {
        setValueByPath(parentObject, ['_query', 'pageToken'], fromPageToken);
    }
    return toObject;
}
function listCachedContentsParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], listCachedContentsConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function cachedContentFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (fromDisplayName != null) {
        setValueByPath(toObject, ['displayName'], fromDisplayName);
    }
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['model'], fromModel);
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    const fromExpireTime = getValueByPath(fromObject, ['expireTime']);
    if (fromExpireTime != null) {
        setValueByPath(toObject, ['expireTime'], fromExpireTime);
    }
    const fromUsageMetadata = getValueByPath(fromObject, [
        'usageMetadata',
    ]);
    if (fromUsageMetadata != null) {
        setValueByPath(toObject, ['usageMetadata'], fromUsageMetadata);
    }
    return toObject;
}
function deleteCachedContentResponseFromMldev() {
    const toObject = {};
    return toObject;
}
function listCachedContentsResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromNextPageToken = getValueByPath(fromObject, [
        'nextPageToken',
    ]);
    if (fromNextPageToken != null) {
        setValueByPath(toObject, ['nextPageToken'], fromNextPageToken);
    }
    const fromCachedContents = getValueByPath(fromObject, [
        'cachedContents',
    ]);
    if (fromCachedContents != null) {
        let transformedList = fromCachedContents;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return cachedContentFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['cachedContents'], transformedList);
    }
    return toObject;
}
function cachedContentFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (fromDisplayName != null) {
        setValueByPath(toObject, ['displayName'], fromDisplayName);
    }
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['model'], fromModel);
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    const fromExpireTime = getValueByPath(fromObject, ['expireTime']);
    if (fromExpireTime != null) {
        setValueByPath(toObject, ['expireTime'], fromExpireTime);
    }
    const fromUsageMetadata = getValueByPath(fromObject, [
        'usageMetadata',
    ]);
    if (fromUsageMetadata != null) {
        setValueByPath(toObject, ['usageMetadata'], fromUsageMetadata);
    }
    return toObject;
}
function deleteCachedContentResponseFromVertex() {
    const toObject = {};
    return toObject;
}
function listCachedContentsResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromNextPageToken = getValueByPath(fromObject, [
        'nextPageToken',
    ]);
    if (fromNextPageToken != null) {
        setValueByPath(toObject, ['nextPageToken'], fromNextPageToken);
    }
    const fromCachedContents = getValueByPath(fromObject, [
        'cachedContents',
    ]);
    if (fromCachedContents != null) {
        let transformedList = fromCachedContents;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return cachedContentFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['cachedContents'], transformedList);
    }
    return toObject;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Pagers for the GenAI List APIs.
 */
var PagedItem;
(function (PagedItem) {
    PagedItem["PAGED_ITEM_BATCH_JOBS"] = "batchJobs";
    PagedItem["PAGED_ITEM_MODELS"] = "models";
    PagedItem["PAGED_ITEM_TUNING_JOBS"] = "tuningJobs";
    PagedItem["PAGED_ITEM_FILES"] = "files";
    PagedItem["PAGED_ITEM_CACHED_CONTENTS"] = "cachedContents";
})(PagedItem || (PagedItem = {}));
/**
 * Pager class for iterating through paginated results.
 */
class Pager {
    constructor(name, request, response, params) {
        this.pageInternal = [];
        this.paramsInternal = {};
        this.requestInternal = request;
        this.init(name, response, params);
    }
    init(name, response, params) {
        var _a, _b;
        this.nameInternal = name;
        this.pageInternal = response[this.nameInternal] || [];
        this.idxInternal = 0;
        let requestParams = { config: {} };
        if (!params) {
            requestParams = { config: {} };
        }
        else if (typeof params === 'object') {
            requestParams = Object.assign({}, params);
        }
        else {
            requestParams = params;
        }
        if (requestParams['config']) {
            requestParams['config']['pageToken'] = response['nextPageToken'];
        }
        this.paramsInternal = requestParams;
        this.pageInternalSize =
            (_b = (_a = requestParams['config']) === null || _a === void 0 ? void 0 : _a['pageSize']) !== null && _b !== void 0 ? _b : this.pageInternal.length;
    }
    initNextPage(response) {
        this.init(this.nameInternal, response, this.paramsInternal);
    }
    /**
     * Returns the current page, which is a list of items.
     *
     * @remarks
     * The first page is retrieved when the pager is created. The returned list of
     * items could be a subset of the entire list.
     */
    get page() {
        return this.pageInternal;
    }
    /**
     * Returns the type of paged item (for example, ``batch_jobs``).
     */
    get name() {
        return this.nameInternal;
    }
    /**
     * Returns the length of the page fetched each time by this pager.
     *
     * @remarks
     * The number of items in the page is less than or equal to the page length.
     */
    get pageSize() {
        return this.pageInternalSize;
    }
    /**
     * Returns the parameters when making the API request for the next page.
     *
     * @remarks
     * Parameters contain a set of optional configs that can be
     * used to customize the API request. For example, the `pageToken` parameter
     * contains the token to request the next page.
     */
    get params() {
        return this.paramsInternal;
    }
    /**
     * Returns the total number of items in the current page.
     */
    get pageLength() {
        return this.pageInternal.length;
    }
    /**
     * Returns the item at the given index.
     */
    getItem(index) {
        return this.pageInternal[index];
    }
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
    [Symbol.asyncIterator]() {
        return {
            next: async () => {
                if (this.idxInternal >= this.pageLength) {
                    if (this.hasNextPage()) {
                        await this.nextPage();
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
                const item = this.getItem(this.idxInternal);
                this.idxInternal += 1;
                return { value: item, done: false };
            },
            return: async () => {
                return { value: undefined, done: true };
            },
        };
    }
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
    async nextPage() {
        if (!this.hasNextPage()) {
            throw new Error('No more pages to fetch.');
        }
        const response = await this.requestInternal(this.params);
        this.initNextPage(response);
        return this.page;
    }
    /**
     * Returns true if there are more pages to fetch from the API.
     */
    hasNextPage() {
        var _a;
        if (((_a = this.params['config']) === null || _a === void 0 ? void 0 : _a['pageToken']) !== undefined) {
            return true;
        }
        return false;
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Code generated by the Google Gen AI SDK generator DO NOT EDIT.
/** Required. Outcome of the code execution. */
var Outcome;
(function (Outcome) {
    Outcome["OUTCOME_UNSPECIFIED"] = "OUTCOME_UNSPECIFIED";
    Outcome["OUTCOME_OK"] = "OUTCOME_OK";
    Outcome["OUTCOME_FAILED"] = "OUTCOME_FAILED";
    Outcome["OUTCOME_DEADLINE_EXCEEDED"] = "OUTCOME_DEADLINE_EXCEEDED";
})(Outcome || (Outcome = {}));
/** Required. Programming language of the `code`. */
var Language;
(function (Language) {
    Language["LANGUAGE_UNSPECIFIED"] = "LANGUAGE_UNSPECIFIED";
    Language["PYTHON"] = "PYTHON";
})(Language || (Language = {}));
/** Required. Harm category. */
var HarmCategory;
(function (HarmCategory) {
    HarmCategory["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
    HarmCategory["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
    HarmCategory["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
    HarmCategory["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
    HarmCategory["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
    HarmCategory["HARM_CATEGORY_CIVIC_INTEGRITY"] = "HARM_CATEGORY_CIVIC_INTEGRITY";
})(HarmCategory || (HarmCategory = {}));
/** Optional. Specify if the threshold is used for probability or severity score. If not specified, the threshold is used for probability score. */
var HarmBlockMethod;
(function (HarmBlockMethod) {
    HarmBlockMethod["HARM_BLOCK_METHOD_UNSPECIFIED"] = "HARM_BLOCK_METHOD_UNSPECIFIED";
    HarmBlockMethod["SEVERITY"] = "SEVERITY";
    HarmBlockMethod["PROBABILITY"] = "PROBABILITY";
})(HarmBlockMethod || (HarmBlockMethod = {}));
/** Required. The harm block threshold. */
var HarmBlockThreshold;
(function (HarmBlockThreshold) {
    HarmBlockThreshold["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
    HarmBlockThreshold["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
    HarmBlockThreshold["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
    HarmBlockThreshold["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
    HarmBlockThreshold["BLOCK_NONE"] = "BLOCK_NONE";
    HarmBlockThreshold["OFF"] = "OFF";
})(HarmBlockThreshold || (HarmBlockThreshold = {}));
/** The mode of the predictor to be used in dynamic retrieval. */
var Mode;
(function (Mode) {
    Mode["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
    Mode["MODE_DYNAMIC"] = "MODE_DYNAMIC";
})(Mode || (Mode = {}));
/** Type of auth scheme. */
var AuthType;
(function (AuthType) {
    AuthType["AUTH_TYPE_UNSPECIFIED"] = "AUTH_TYPE_UNSPECIFIED";
    AuthType["NO_AUTH"] = "NO_AUTH";
    AuthType["API_KEY_AUTH"] = "API_KEY_AUTH";
    AuthType["HTTP_BASIC_AUTH"] = "HTTP_BASIC_AUTH";
    AuthType["GOOGLE_SERVICE_ACCOUNT_AUTH"] = "GOOGLE_SERVICE_ACCOUNT_AUTH";
    AuthType["OAUTH"] = "OAUTH";
    AuthType["OIDC_AUTH"] = "OIDC_AUTH";
})(AuthType || (AuthType = {}));
/** Optional. The type of the data. */
var Type;
(function (Type) {
    Type["TYPE_UNSPECIFIED"] = "TYPE_UNSPECIFIED";
    Type["STRING"] = "STRING";
    Type["NUMBER"] = "NUMBER";
    Type["INTEGER"] = "INTEGER";
    Type["BOOLEAN"] = "BOOLEAN";
    Type["ARRAY"] = "ARRAY";
    Type["OBJECT"] = "OBJECT";
})(Type || (Type = {}));
/** Output only. The reason why the model stopped generating tokens.

  If empty, the model has not stopped generating the tokens.
   */
var FinishReason;
(function (FinishReason) {
    FinishReason["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
    FinishReason["STOP"] = "STOP";
    FinishReason["MAX_TOKENS"] = "MAX_TOKENS";
    FinishReason["SAFETY"] = "SAFETY";
    FinishReason["RECITATION"] = "RECITATION";
    FinishReason["LANGUAGE"] = "LANGUAGE";
    FinishReason["OTHER"] = "OTHER";
    FinishReason["BLOCKLIST"] = "BLOCKLIST";
    FinishReason["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
    FinishReason["SPII"] = "SPII";
    FinishReason["MALFORMED_FUNCTION_CALL"] = "MALFORMED_FUNCTION_CALL";
    FinishReason["IMAGE_SAFETY"] = "IMAGE_SAFETY";
})(FinishReason || (FinishReason = {}));
/** Output only. Harm probability levels in the content. */
var HarmProbability;
(function (HarmProbability) {
    HarmProbability["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
    HarmProbability["NEGLIGIBLE"] = "NEGLIGIBLE";
    HarmProbability["LOW"] = "LOW";
    HarmProbability["MEDIUM"] = "MEDIUM";
    HarmProbability["HIGH"] = "HIGH";
})(HarmProbability || (HarmProbability = {}));
/** Output only. Harm severity levels in the content. */
var HarmSeverity;
(function (HarmSeverity) {
    HarmSeverity["HARM_SEVERITY_UNSPECIFIED"] = "HARM_SEVERITY_UNSPECIFIED";
    HarmSeverity["HARM_SEVERITY_NEGLIGIBLE"] = "HARM_SEVERITY_NEGLIGIBLE";
    HarmSeverity["HARM_SEVERITY_LOW"] = "HARM_SEVERITY_LOW";
    HarmSeverity["HARM_SEVERITY_MEDIUM"] = "HARM_SEVERITY_MEDIUM";
    HarmSeverity["HARM_SEVERITY_HIGH"] = "HARM_SEVERITY_HIGH";
})(HarmSeverity || (HarmSeverity = {}));
/** Output only. Blocked reason. */
var BlockedReason;
(function (BlockedReason) {
    BlockedReason["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
    BlockedReason["SAFETY"] = "SAFETY";
    BlockedReason["OTHER"] = "OTHER";
    BlockedReason["BLOCKLIST"] = "BLOCKLIST";
    BlockedReason["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
})(BlockedReason || (BlockedReason = {}));
/** Output only. Traffic type. This shows whether a request consumes Pay-As-You-Go or Provisioned Throughput quota. */
var TrafficType;
(function (TrafficType) {
    TrafficType["TRAFFIC_TYPE_UNSPECIFIED"] = "TRAFFIC_TYPE_UNSPECIFIED";
    TrafficType["ON_DEMAND"] = "ON_DEMAND";
    TrafficType["PROVISIONED_THROUGHPUT"] = "PROVISIONED_THROUGHPUT";
})(TrafficType || (TrafficType = {}));
/** Server content modalities. */
var Modality;
(function (Modality) {
    Modality["MODALITY_UNSPECIFIED"] = "MODALITY_UNSPECIFIED";
    Modality["TEXT"] = "TEXT";
    Modality["IMAGE"] = "IMAGE";
    Modality["AUDIO"] = "AUDIO";
})(Modality || (Modality = {}));
/** The media resolution to use. */
var MediaResolution;
(function (MediaResolution) {
    MediaResolution["MEDIA_RESOLUTION_UNSPECIFIED"] = "MEDIA_RESOLUTION_UNSPECIFIED";
    MediaResolution["MEDIA_RESOLUTION_LOW"] = "MEDIA_RESOLUTION_LOW";
    MediaResolution["MEDIA_RESOLUTION_MEDIUM"] = "MEDIA_RESOLUTION_MEDIUM";
    MediaResolution["MEDIA_RESOLUTION_HIGH"] = "MEDIA_RESOLUTION_HIGH";
})(MediaResolution || (MediaResolution = {}));
/** Output only. The detailed state of the job. */
var JobState;
(function (JobState) {
    JobState["JOB_STATE_UNSPECIFIED"] = "JOB_STATE_UNSPECIFIED";
    JobState["JOB_STATE_QUEUED"] = "JOB_STATE_QUEUED";
    JobState["JOB_STATE_PENDING"] = "JOB_STATE_PENDING";
    JobState["JOB_STATE_RUNNING"] = "JOB_STATE_RUNNING";
    JobState["JOB_STATE_SUCCEEDED"] = "JOB_STATE_SUCCEEDED";
    JobState["JOB_STATE_FAILED"] = "JOB_STATE_FAILED";
    JobState["JOB_STATE_CANCELLING"] = "JOB_STATE_CANCELLING";
    JobState["JOB_STATE_CANCELLED"] = "JOB_STATE_CANCELLED";
    JobState["JOB_STATE_PAUSED"] = "JOB_STATE_PAUSED";
    JobState["JOB_STATE_EXPIRED"] = "JOB_STATE_EXPIRED";
    JobState["JOB_STATE_UPDATING"] = "JOB_STATE_UPDATING";
    JobState["JOB_STATE_PARTIALLY_SUCCEEDED"] = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(JobState || (JobState = {}));
/** Optional. Adapter size for tuning. */
var AdapterSize;
(function (AdapterSize) {
    AdapterSize["ADAPTER_SIZE_UNSPECIFIED"] = "ADAPTER_SIZE_UNSPECIFIED";
    AdapterSize["ADAPTER_SIZE_ONE"] = "ADAPTER_SIZE_ONE";
    AdapterSize["ADAPTER_SIZE_TWO"] = "ADAPTER_SIZE_TWO";
    AdapterSize["ADAPTER_SIZE_FOUR"] = "ADAPTER_SIZE_FOUR";
    AdapterSize["ADAPTER_SIZE_EIGHT"] = "ADAPTER_SIZE_EIGHT";
    AdapterSize["ADAPTER_SIZE_SIXTEEN"] = "ADAPTER_SIZE_SIXTEEN";
    AdapterSize["ADAPTER_SIZE_THIRTY_TWO"] = "ADAPTER_SIZE_THIRTY_TWO";
})(AdapterSize || (AdapterSize = {}));
/** Options for feature selection preference. */
var FeatureSelectionPreference;
(function (FeatureSelectionPreference) {
    FeatureSelectionPreference["FEATURE_SELECTION_PREFERENCE_UNSPECIFIED"] = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED";
    FeatureSelectionPreference["PRIORITIZE_QUALITY"] = "PRIORITIZE_QUALITY";
    FeatureSelectionPreference["BALANCED"] = "BALANCED";
    FeatureSelectionPreference["PRIORITIZE_COST"] = "PRIORITIZE_COST";
})(FeatureSelectionPreference || (FeatureSelectionPreference = {}));
/** Config for the dynamic retrieval config mode. */
var DynamicRetrievalConfigMode;
(function (DynamicRetrievalConfigMode) {
    DynamicRetrievalConfigMode["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
    DynamicRetrievalConfigMode["MODE_DYNAMIC"] = "MODE_DYNAMIC";
})(DynamicRetrievalConfigMode || (DynamicRetrievalConfigMode = {}));
/** Config for the function calling config mode. */
var FunctionCallingConfigMode;
(function (FunctionCallingConfigMode) {
    FunctionCallingConfigMode["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
    FunctionCallingConfigMode["AUTO"] = "AUTO";
    FunctionCallingConfigMode["ANY"] = "ANY";
    FunctionCallingConfigMode["NONE"] = "NONE";
})(FunctionCallingConfigMode || (FunctionCallingConfigMode = {}));
/** Enum that controls the safety filter level for objectionable content. */
var SafetyFilterLevel;
(function (SafetyFilterLevel) {
    SafetyFilterLevel["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
    SafetyFilterLevel["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
    SafetyFilterLevel["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
    SafetyFilterLevel["BLOCK_NONE"] = "BLOCK_NONE";
})(SafetyFilterLevel || (SafetyFilterLevel = {}));
/** Enum that controls the generation of people. */
var PersonGeneration;
(function (PersonGeneration) {
    PersonGeneration["DONT_ALLOW"] = "DONT_ALLOW";
    PersonGeneration["ALLOW_ADULT"] = "ALLOW_ADULT";
    PersonGeneration["ALLOW_ALL"] = "ALLOW_ALL";
})(PersonGeneration || (PersonGeneration = {}));
/** Enum that specifies the language of the text in the prompt. */
var ImagePromptLanguage;
(function (ImagePromptLanguage) {
    ImagePromptLanguage["auto"] = "auto";
    ImagePromptLanguage["en"] = "en";
    ImagePromptLanguage["ja"] = "ja";
    ImagePromptLanguage["ko"] = "ko";
    ImagePromptLanguage["hi"] = "hi";
})(ImagePromptLanguage || (ImagePromptLanguage = {}));
/** State for the lifecycle of a File. */
var FileState;
(function (FileState) {
    FileState["STATE_UNSPECIFIED"] = "STATE_UNSPECIFIED";
    FileState["PROCESSING"] = "PROCESSING";
    FileState["ACTIVE"] = "ACTIVE";
    FileState["FAILED"] = "FAILED";
})(FileState || (FileState = {}));
/** Source of the File. */
var FileSource;
(function (FileSource) {
    FileSource["SOURCE_UNSPECIFIED"] = "SOURCE_UNSPECIFIED";
    FileSource["UPLOADED"] = "UPLOADED";
    FileSource["GENERATED"] = "GENERATED";
})(FileSource || (FileSource = {}));
/** Enum representing the mask mode of a mask reference image. */
var MaskReferenceMode;
(function (MaskReferenceMode) {
    MaskReferenceMode["MASK_MODE_DEFAULT"] = "MASK_MODE_DEFAULT";
    MaskReferenceMode["MASK_MODE_USER_PROVIDED"] = "MASK_MODE_USER_PROVIDED";
    MaskReferenceMode["MASK_MODE_BACKGROUND"] = "MASK_MODE_BACKGROUND";
    MaskReferenceMode["MASK_MODE_FOREGROUND"] = "MASK_MODE_FOREGROUND";
    MaskReferenceMode["MASK_MODE_SEMANTIC"] = "MASK_MODE_SEMANTIC";
})(MaskReferenceMode || (MaskReferenceMode = {}));
/** Enum representing the control type of a control reference image. */
var ControlReferenceType;
(function (ControlReferenceType) {
    ControlReferenceType["CONTROL_TYPE_DEFAULT"] = "CONTROL_TYPE_DEFAULT";
    ControlReferenceType["CONTROL_TYPE_CANNY"] = "CONTROL_TYPE_CANNY";
    ControlReferenceType["CONTROL_TYPE_SCRIBBLE"] = "CONTROL_TYPE_SCRIBBLE";
    ControlReferenceType["CONTROL_TYPE_FACE_MESH"] = "CONTROL_TYPE_FACE_MESH";
})(ControlReferenceType || (ControlReferenceType = {}));
/** Enum representing the subject type of a subject reference image. */
var SubjectReferenceType;
(function (SubjectReferenceType) {
    SubjectReferenceType["SUBJECT_TYPE_DEFAULT"] = "SUBJECT_TYPE_DEFAULT";
    SubjectReferenceType["SUBJECT_TYPE_PERSON"] = "SUBJECT_TYPE_PERSON";
    SubjectReferenceType["SUBJECT_TYPE_ANIMAL"] = "SUBJECT_TYPE_ANIMAL";
    SubjectReferenceType["SUBJECT_TYPE_PRODUCT"] = "SUBJECT_TYPE_PRODUCT";
})(SubjectReferenceType || (SubjectReferenceType = {}));
/** Server content modalities. */
var MediaModality;
(function (MediaModality) {
    MediaModality["MODALITY_UNSPECIFIED"] = "MODALITY_UNSPECIFIED";
    MediaModality["TEXT"] = "TEXT";
    MediaModality["IMAGE"] = "IMAGE";
    MediaModality["VIDEO"] = "VIDEO";
    MediaModality["AUDIO"] = "AUDIO";
    MediaModality["DOCUMENT"] = "DOCUMENT";
})(MediaModality || (MediaModality = {}));
/** Start of speech sensitivity. */
var StartSensitivity;
(function (StartSensitivity) {
    StartSensitivity["START_SENSITIVITY_UNSPECIFIED"] = "START_SENSITIVITY_UNSPECIFIED";
    StartSensitivity["START_SENSITIVITY_HIGH"] = "START_SENSITIVITY_HIGH";
    StartSensitivity["START_SENSITIVITY_LOW"] = "START_SENSITIVITY_LOW";
})(StartSensitivity || (StartSensitivity = {}));
/** End of speech sensitivity. */
var EndSensitivity;
(function (EndSensitivity) {
    EndSensitivity["END_SENSITIVITY_UNSPECIFIED"] = "END_SENSITIVITY_UNSPECIFIED";
    EndSensitivity["END_SENSITIVITY_HIGH"] = "END_SENSITIVITY_HIGH";
    EndSensitivity["END_SENSITIVITY_LOW"] = "END_SENSITIVITY_LOW";
})(EndSensitivity || (EndSensitivity = {}));
/** The different ways of handling user activity. */
var ActivityHandling;
(function (ActivityHandling) {
    ActivityHandling["ACTIVITY_HANDLING_UNSPECIFIED"] = "ACTIVITY_HANDLING_UNSPECIFIED";
    ActivityHandling["START_OF_ACTIVITY_INTERRUPTS"] = "START_OF_ACTIVITY_INTERRUPTS";
    ActivityHandling["NO_INTERRUPTION"] = "NO_INTERRUPTION";
})(ActivityHandling || (ActivityHandling = {}));
/** Options about which input is included in the user's turn. */
var TurnCoverage;
(function (TurnCoverage) {
    TurnCoverage["TURN_COVERAGE_UNSPECIFIED"] = "TURN_COVERAGE_UNSPECIFIED";
    TurnCoverage["TURN_INCLUDES_ONLY_ACTIVITY"] = "TURN_INCLUDES_ONLY_ACTIVITY";
    TurnCoverage["TURN_INCLUDES_ALL_INPUT"] = "TURN_INCLUDES_ALL_INPUT";
})(TurnCoverage || (TurnCoverage = {}));
/** A function response. */
class FunctionResponse {
}
/**
 * Creates a `Part` object from a `URI` string.
 */
function createPartFromUri(uri, mimeType) {
    return {
        fileData: {
            fileUri: uri,
            mimeType: mimeType,
        },
    };
}
/**
 * Creates a `Part` object from a `text` string.
 */
function createPartFromText(text) {
    return {
        text: text,
    };
}
/**
 * Creates a `Part` object from a `FunctionCall` object.
 */
function createPartFromFunctionCall(name, args) {
    return {
        functionCall: {
            name: name,
            args: args,
        },
    };
}
/**
 * Creates a `Part` object from a `FunctionResponse` object.
 */
function createPartFromFunctionResponse(id, name, response) {
    return {
        functionResponse: {
            id: id,
            name: name,
            response: response,
        },
    };
}
/**
 * Creates a `Part` object from a `base64` encoded `string`.
 */
function createPartFromBase64(data, mimeType) {
    return {
        inlineData: {
            data: data,
            mimeType: mimeType,
        },
    };
}
/**
 * Creates a `Part` object from the `outcome` and `output` of a `CodeExecutionResult` object.
 */
function createPartFromCodeExecutionResult(outcome, output) {
    return {
        codeExecutionResult: {
            outcome: outcome,
            output: output,
        },
    };
}
/**
 * Creates a `Part` object from the `code` and `language` of an `ExecutableCode` object.
 */
function createPartFromExecutableCode(code, language) {
    return {
        executableCode: {
            code: code,
            language: language,
        },
    };
}
function _isPart(obj) {
    if (typeof obj === 'object' && obj !== null) {
        return ('fileData' in obj ||
            'text' in obj ||
            'functionCall' in obj ||
            'functionResponse' in obj ||
            'inlineData' in obj ||
            'videoMetadata' in obj ||
            'codeExecutionResult' in obj ||
            'executableCode' in obj);
    }
    return false;
}
function _toParts(partOrString) {
    const parts = [];
    if (typeof partOrString === 'string') {
        parts.push(createPartFromText(partOrString));
    }
    else if (_isPart(partOrString)) {
        parts.push(partOrString);
    }
    else if (Array.isArray(partOrString)) {
        if (partOrString.length === 0) {
            throw new Error('partOrString cannot be an empty array');
        }
        for (const part of partOrString) {
            if (typeof part === 'string') {
                parts.push(createPartFromText(part));
            }
            else if (_isPart(part)) {
                parts.push(part);
            }
            else {
                throw new Error('element in PartUnion must be a Part object or string');
            }
        }
    }
    else {
        throw new Error('partOrString must be a Part object, string, or array');
    }
    return parts;
}
/**
 * Creates a `Content` object with a user role from a `PartListUnion` object or `string`.
 */
function createUserContent(partOrString) {
    return {
        role: 'user',
        parts: _toParts(partOrString),
    };
}
/**
 * Creates a `Content` object with a model role from a `PartListUnion` object or `string`.
 */
function createModelContent(partOrString) {
    return {
        role: 'model',
        parts: _toParts(partOrString),
    };
}
/** Content filter results for a prompt sent in the request. */
class GenerateContentResponsePromptFeedback {
}
/** Usage metadata about response(s). */
class GenerateContentResponseUsageMetadata {
}
/** Response message for PredictionService.GenerateContent. */
class GenerateContentResponse {
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
    get text() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
            return undefined;
        }
        if (this.candidates && this.candidates.length > 1) {
            console.warn('there are multiple candidates in the response, returning text from the first one.');
        }
        let text = '';
        let anyTextPartText = false;
        const nonTextParts = [];
        for (const part of (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) !== null && _h !== void 0 ? _h : []) {
            for (const [fieldName, fieldValue] of Object.entries(part)) {
                if (fieldName !== 'text' &&
                    fieldName !== 'thought' &&
                    (fieldValue !== null || fieldValue !== undefined)) {
                    nonTextParts.push(fieldName);
                }
            }
            if (typeof part.text === 'string') {
                if (typeof part.thought === 'boolean' && part.thought) {
                    continue;
                }
                anyTextPartText = true;
                text += part.text;
            }
        }
        if (nonTextParts.length > 0) {
            console.warn(`there are non-text parts ${nonTextParts} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`);
        }
        // part.text === '' is different from part.text is null
        return anyTextPartText ? text : undefined;
    }
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
    get data() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
            return undefined;
        }
        if (this.candidates && this.candidates.length > 1) {
            console.warn('there are multiple candidates in the response, returning data from the first one.');
        }
        let data = '';
        const nonDataParts = [];
        for (const part of (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) !== null && _h !== void 0 ? _h : []) {
            for (const [fieldName, fieldValue] of Object.entries(part)) {
                if (fieldName !== 'inlineData' &&
                    (fieldValue !== null || fieldValue !== undefined)) {
                    nonDataParts.push(fieldName);
                }
            }
            if (part.inlineData && typeof part.inlineData.data === 'string') {
                data += atob(part.inlineData.data);
            }
        }
        if (nonDataParts.length > 0) {
            console.warn(`there are non-data parts ${nonDataParts} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`);
        }
        return data.length > 0 ? btoa(data) : undefined;
    }
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
    get functionCalls() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
            return undefined;
        }
        if (this.candidates && this.candidates.length > 1) {
            console.warn('there are multiple candidates in the response, returning function calls from the first one.');
        }
        const functionCalls = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.functionCall).map((part) => part.functionCall).filter((functionCall) => functionCall !== undefined);
        if ((functionCalls === null || functionCalls === void 0 ? void 0 : functionCalls.length) === 0) {
            return undefined;
        }
        return functionCalls;
    }
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
    get executableCode() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
            return undefined;
        }
        if (this.candidates && this.candidates.length > 1) {
            console.warn('there are multiple candidates in the response, returning executable code from the first one.');
        }
        const executableCode = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.executableCode).map((part) => part.executableCode).filter((executableCode) => executableCode !== undefined);
        if ((executableCode === null || executableCode === void 0 ? void 0 : executableCode.length) === 0) {
            return undefined;
        }
        return (_j = executableCode === null || executableCode === void 0 ? void 0 : executableCode[0]) === null || _j === void 0 ? void 0 : _j.code;
    }
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
    get codeExecutionResult() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (((_d = (_c = (_b = (_a = this.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
            return undefined;
        }
        if (this.candidates && this.candidates.length > 1) {
            console.warn('there are multiple candidates in the response, returning code execution result from the first one.');
        }
        const codeExecutionResult = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.codeExecutionResult).map((part) => part.codeExecutionResult).filter((codeExecutionResult) => codeExecutionResult !== undefined);
        if ((codeExecutionResult === null || codeExecutionResult === void 0 ? void 0 : codeExecutionResult.length) === 0) {
            return undefined;
        }
        return (_j = codeExecutionResult === null || codeExecutionResult === void 0 ? void 0 : codeExecutionResult[0]) === null || _j === void 0 ? void 0 : _j.output;
    }
}
/** Response for the embed_content method. */
class EmbedContentResponse {
}
/** The output images response. */
class GenerateImagesResponse {
}
class ListModelsResponse {
}
class DeleteModelResponse {
}
/** Response for counting tokens. */
class CountTokensResponse {
}
/** Response for computing tokens. */
class ComputeTokensResponse {
}
/** Response with generated videos. */
class GenerateVideosResponse {
}
/** Response for the list tuning jobs method. */
class ListTuningJobsResponse {
}
/** Empty response for caches.delete method. */
class DeleteCachedContentResponse {
}
class ListCachedContentsResponse {
}
/** Response for the list files method. */
class ListFilesResponse {
}
/** A wrapper class for the http response. */
class HttpResponse {
    constructor(response) {
        // Process the headers.
        const headers = {};
        for (const pair of response.headers.entries()) {
            headers[pair[0]] = pair[1];
        }
        this.headers = headers;
        // Keep the original response.
        this.responseInternal = response;
    }
    json() {
        return this.responseInternal.json();
    }
}
/** Response for the create file method. */
class CreateFileResponse {
}
/** Response for the delete file method. */
class DeleteFileResponse {
}
/** Represents a single response in a replay. */
class ReplayResponse {
}
/** Response message for API call. */
class LiveServerMessage {
    /**
     * Returns the concatenation of all text parts from the server content if present.
     *
     * @remarks
     * If there are non-text parts in the response, the concatenation of all text
     * parts will be returned, and a warning will be logged.
     */
    get text() {
        var _a, _b, _c;
        let text = '';
        let anyTextPartFound = false;
        const nonTextParts = [];
        for (const part of (_c = (_b = (_a = this.serverContent) === null || _a === void 0 ? void 0 : _a.modelTurn) === null || _b === void 0 ? void 0 : _b.parts) !== null && _c !== void 0 ? _c : []) {
            for (const [fieldName, fieldValue] of Object.entries(part)) {
                if (fieldName !== 'text' &&
                    fieldName !== 'thought' &&
                    fieldValue !== null) {
                    nonTextParts.push(fieldName);
                }
            }
            if (typeof part.text === 'string') {
                if (typeof part.thought === 'boolean' && part.thought) {
                    continue;
                }
                anyTextPartFound = true;
                text += part.text;
            }
        }
        if (nonTextParts.length > 0) {
            console.warn(`there are non-text parts ${nonTextParts} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`);
        }
        // part.text === '' is different from part.text is null
        return anyTextPartFound ? text : undefined;
    }
    /**
     * Returns the concatenation of all inline data parts from the server content if present.
     *
     * @remarks
     * If there are non-inline data parts in the
     * response, the concatenation of all inline data parts will be returned, and
     * a warning will be logged.
     */
    get data() {
        var _a, _b, _c;
        let data = '';
        const nonDataParts = [];
        for (const part of (_c = (_b = (_a = this.serverContent) === null || _a === void 0 ? void 0 : _a.modelTurn) === null || _b === void 0 ? void 0 : _b.parts) !== null && _c !== void 0 ? _c : []) {
            for (const [fieldName, fieldValue] of Object.entries(part)) {
                if (fieldName !== 'inlineData' && fieldValue !== null) {
                    nonDataParts.push(fieldName);
                }
            }
            if (part.inlineData && typeof part.inlineData.data === 'string') {
                data += atob(part.inlineData.data);
            }
        }
        if (nonDataParts.length > 0) {
            console.warn(`there are non-data parts ${nonDataParts} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`);
        }
        return data.length > 0 ? btoa(data) : undefined;
    }
}
/** Client generated response to a `ToolCall` received from the server.

  Individual `FunctionResponse` objects are matched to the respective
  `FunctionCall` objects by the `id` field.

  Note that in the unary and server-streaming GenerateContent APIs function
  calling happens by exchanging the `Content` parts, while in the bidi
  GenerateContent APIs function calling happens over this dedicated set of
  messages.
   */
class LiveClientToolResponse {
}
/** Parameters for sending tool responses to the live API. */
class LiveSendToolResponseParameters {
    constructor() {
        /** Tool responses to send to the session. */
        this.functionResponses = [];
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Caches extends BaseModule {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
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
        this.list = async (params = {}) => {
            return new Pager(PagedItem.PAGED_ITEM_CACHED_CONTENTS, (x) => this.listInternal(x), await this.listInternal(params), params);
        };
    }
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
    async create(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = createCachedContentParametersToVertex(this.apiClient, params);
            path = formatMap('cachedContents', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = cachedContentFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = createCachedContentParametersToMldev(this.apiClient, params);
            path = formatMap('cachedContents', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = cachedContentFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
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
    async get(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = getCachedContentParametersToVertex(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = cachedContentFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = getCachedContentParametersToMldev(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = cachedContentFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
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
    async delete(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = deleteCachedContentParametersToVertex(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'DELETE',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then(() => {
                const resp = deleteCachedContentResponseFromVertex();
                const typedResp = new DeleteCachedContentResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = deleteCachedContentParametersToMldev(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'DELETE',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then(() => {
                const resp = deleteCachedContentResponseFromMldev();
                const typedResp = new DeleteCachedContentResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
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
    async update(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = updateCachedContentParametersToVertex(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'PATCH',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = cachedContentFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = updateCachedContentParametersToMldev(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'PATCH',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = cachedContentFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
    async listInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = listCachedContentsParametersToVertex(this.apiClient, params);
            path = formatMap('cachedContents', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = listCachedContentsResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new ListCachedContentsResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = listCachedContentsParametersToMldev(this.apiClient, params);
            path = formatMap('cachedContents', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = listCachedContentsResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new ListCachedContentsResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Returns true if the response is valid, false otherwise.
 */
function isValidResponse(response) {
    var _a;
    if (response.candidates == undefined || response.candidates.length === 0) {
        return false;
    }
    const content = (_a = response.candidates[0]) === null || _a === void 0 ? void 0 : _a.content;
    if (content === undefined) {
        return false;
    }
    return isValidContent(content);
}
function isValidContent(content) {
    if (content.parts === undefined || content.parts.length === 0) {
        return false;
    }
    for (const part of content.parts) {
        if (part === undefined || Object.keys(part).length === 0) {
            return false;
        }
        if (part.text !== undefined && part.text === '') {
            return false;
        }
    }
    return true;
}
/**
 * Validates the history contains the correct roles.
 *
 * @remarks
 * Expects the history to start with a user turn and then alternate between
 * user and model turns.
 *
 * @throws Error if the history does not start with a user turn.
 * @throws Error if the history contains an invalid role.
 */
function validateHistory(history) {
    // Empty history is valid.
    if (history.length === 0) {
        return;
    }
    if (history[0].role !== 'user') {
        throw new Error('History must start with a user turn.');
    }
    for (const content of history) {
        if (content.role !== 'user' && content.role !== 'model') {
            throw new Error(`Role must be user or model, but got ${content.role}.`);
        }
    }
}
/**
 * Extracts the curated (valid) history from a comprehensive history.
 *
 * @remarks
 * The model may sometimes generate invalid or empty contents(e.g., due to safty
 * filters or recitation). Extracting valid turns from the history
 * ensures that subsequent requests could be accpeted by the model.
 */
function extractCuratedHistory(comprehensiveHistory) {
    if (comprehensiveHistory === undefined || comprehensiveHistory.length === 0) {
        return [];
    }
    const curatedHistory = [];
    const length = comprehensiveHistory.length;
    let i = 0;
    let userInput = comprehensiveHistory[0];
    while (i < length) {
        if (comprehensiveHistory[i].role === 'user') {
            userInput = comprehensiveHistory[i];
            i++;
        }
        else {
            const modelOutput = [];
            let isValid = true;
            while (i < length && comprehensiveHistory[i].role === 'model') {
                modelOutput.push(comprehensiveHistory[i]);
                if (isValid && !isValidContent(comprehensiveHistory[i])) {
                    isValid = false;
                }
                i++;
            }
            if (isValid) {
                curatedHistory.push(userInput);
                curatedHistory.push(...modelOutput);
            }
        }
    }
    return curatedHistory;
}
/**
 * A utility class to create a chat session.
 */
class Chats {
    constructor(modelsModule, apiClient) {
        this.modelsModule = modelsModule;
        this.apiClient = apiClient;
    }
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
    create(params) {
        return new Chat(this.apiClient, this.modelsModule, params.model, params.config, params.history);
    }
}
/**
 * Chat session that enables sending messages to the model with previous
 * conversation context.
 *
 * @remarks
 * The session maintains all the turns between user and model.
 */
class Chat {
    constructor(apiClient, modelsModule, model, config = {}, history = []) {
        this.apiClient = apiClient;
        this.modelsModule = modelsModule;
        this.model = model;
        this.config = config;
        this.history = history;
        // A promise to represent the current state of the message being sent to the
        // model.
        this.sendPromise = Promise.resolve();
        validateHistory(history);
    }
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
    async sendMessage(params) {
        var _a;
        await this.sendPromise;
        const inputContent = tContent(this.apiClient, params.message);
        const responsePromise = this.modelsModule.generateContent({
            model: this.model,
            contents: this.getHistory(true).concat(inputContent),
            config: (_a = params.config) !== null && _a !== void 0 ? _a : this.config,
        });
        this.sendPromise = (async () => {
            var _a, _b;
            const response = await responsePromise;
            const outputContent = (_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content;
            const modelOutput = outputContent ? [outputContent] : [];
            this.recordHistory(inputContent, modelOutput);
            return;
        })();
        await this.sendPromise;
        return responsePromise;
    }
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
    async sendMessageStream(params) {
        var _a;
        await this.sendPromise;
        const inputContent = tContent(this.apiClient, params.message);
        const streamResponse = this.modelsModule.generateContentStream({
            model: this.model,
            contents: this.getHistory(true).concat(inputContent),
            config: (_a = params.config) !== null && _a !== void 0 ? _a : this.config,
        });
        // Resolve the internal tracking of send completion promise - `sendPromise`
        // for both success and failure response. The actual failure is still
        // propagated by the `await streamResponse`.
        this.sendPromise = streamResponse
            .then(() => undefined)
            .catch(() => undefined);
        const response = await streamResponse;
        const result = this.processStreamResponse(response, inputContent);
        return result;
    }
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
    getHistory(curated = false) {
        return curated ? extractCuratedHistory(this.history) : this.history;
    }
    processStreamResponse(streamResponse, inputContent) {
        var _a, _b;
        return __asyncGenerator(this, arguments, function* processStreamResponse_1() {
            var _c, e_1, _d, _e;
            const outputContent = [];
            try {
                for (var _f = true, streamResponse_1 = __asyncValues(streamResponse), streamResponse_1_1; streamResponse_1_1 = yield __await(streamResponse_1.next()), _c = streamResponse_1_1.done, !_c; _f = true) {
                    _e = streamResponse_1_1.value;
                    _f = false;
                    const chunk = _e;
                    if (isValidResponse(chunk)) {
                        const content = (_b = (_a = chunk.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content;
                        if (content !== undefined) {
                            outputContent.push(content);
                        }
                    }
                    yield yield __await(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_f && !_c && (_d = streamResponse_1.return)) yield __await(_d.call(streamResponse_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.recordHistory(inputContent, outputContent);
        });
    }
    recordHistory(userInput, modelOutput) {
        let outputContents = [];
        if (modelOutput.length > 0 &&
            modelOutput.every((content) => content.role === 'model')) {
            outputContents = modelOutput;
        }
        else {
            // Appends an empty content when model returns empty response, so that the
            // history is always alternating between user and model.
            outputContents.push({
                role: 'model',
                parts: [],
            });
        }
        this.history.push(userInput);
        this.history.push(...outputContents);
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function listFilesConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromPageSize = getValueByPath(fromObject, ['pageSize']);
    if (parentObject !== undefined && fromPageSize != null) {
        setValueByPath(parentObject, ['_query', 'pageSize'], fromPageSize);
    }
    const fromPageToken = getValueByPath(fromObject, ['pageToken']);
    if (parentObject !== undefined && fromPageToken != null) {
        setValueByPath(parentObject, ['_query', 'pageToken'], fromPageToken);
    }
    return toObject;
}
function listFilesParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], listFilesConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function fileStatusToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromDetails = getValueByPath(fromObject, ['details']);
    if (fromDetails != null) {
        setValueByPath(toObject, ['details'], fromDetails);
    }
    const fromMessage = getValueByPath(fromObject, ['message']);
    if (fromMessage != null) {
        setValueByPath(toObject, ['message'], fromMessage);
    }
    const fromCode = getValueByPath(fromObject, ['code']);
    if (fromCode != null) {
        setValueByPath(toObject, ['code'], fromCode);
    }
    return toObject;
}
function fileToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (fromDisplayName != null) {
        setValueByPath(toObject, ['displayName'], fromDisplayName);
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    const fromSizeBytes = getValueByPath(fromObject, ['sizeBytes']);
    if (fromSizeBytes != null) {
        setValueByPath(toObject, ['sizeBytes'], fromSizeBytes);
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromExpirationTime = getValueByPath(fromObject, [
        'expirationTime',
    ]);
    if (fromExpirationTime != null) {
        setValueByPath(toObject, ['expirationTime'], fromExpirationTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    const fromSha256Hash = getValueByPath(fromObject, ['sha256Hash']);
    if (fromSha256Hash != null) {
        setValueByPath(toObject, ['sha256Hash'], fromSha256Hash);
    }
    const fromUri = getValueByPath(fromObject, ['uri']);
    if (fromUri != null) {
        setValueByPath(toObject, ['uri'], fromUri);
    }
    const fromDownloadUri = getValueByPath(fromObject, ['downloadUri']);
    if (fromDownloadUri != null) {
        setValueByPath(toObject, ['downloadUri'], fromDownloadUri);
    }
    const fromState = getValueByPath(fromObject, ['state']);
    if (fromState != null) {
        setValueByPath(toObject, ['state'], fromState);
    }
    const fromSource = getValueByPath(fromObject, ['source']);
    if (fromSource != null) {
        setValueByPath(toObject, ['source'], fromSource);
    }
    const fromVideoMetadata = getValueByPath(fromObject, [
        'videoMetadata',
    ]);
    if (fromVideoMetadata != null) {
        setValueByPath(toObject, ['videoMetadata'], fromVideoMetadata);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fileStatusToMldev(apiClient, fromError));
    }
    return toObject;
}
function createFileParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromFile = getValueByPath(fromObject, ['file']);
    if (fromFile != null) {
        setValueByPath(toObject, ['file'], fileToMldev(apiClient, fromFile));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function getFileParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'file'], tFileName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function deleteFileParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'file'], tFileName(apiClient, fromName));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function fileStatusFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromDetails = getValueByPath(fromObject, ['details']);
    if (fromDetails != null) {
        setValueByPath(toObject, ['details'], fromDetails);
    }
    const fromMessage = getValueByPath(fromObject, ['message']);
    if (fromMessage != null) {
        setValueByPath(toObject, ['message'], fromMessage);
    }
    const fromCode = getValueByPath(fromObject, ['code']);
    if (fromCode != null) {
        setValueByPath(toObject, ['code'], fromCode);
    }
    return toObject;
}
function fileFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (fromDisplayName != null) {
        setValueByPath(toObject, ['displayName'], fromDisplayName);
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    const fromSizeBytes = getValueByPath(fromObject, ['sizeBytes']);
    if (fromSizeBytes != null) {
        setValueByPath(toObject, ['sizeBytes'], fromSizeBytes);
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromExpirationTime = getValueByPath(fromObject, [
        'expirationTime',
    ]);
    if (fromExpirationTime != null) {
        setValueByPath(toObject, ['expirationTime'], fromExpirationTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    const fromSha256Hash = getValueByPath(fromObject, ['sha256Hash']);
    if (fromSha256Hash != null) {
        setValueByPath(toObject, ['sha256Hash'], fromSha256Hash);
    }
    const fromUri = getValueByPath(fromObject, ['uri']);
    if (fromUri != null) {
        setValueByPath(toObject, ['uri'], fromUri);
    }
    const fromDownloadUri = getValueByPath(fromObject, ['downloadUri']);
    if (fromDownloadUri != null) {
        setValueByPath(toObject, ['downloadUri'], fromDownloadUri);
    }
    const fromState = getValueByPath(fromObject, ['state']);
    if (fromState != null) {
        setValueByPath(toObject, ['state'], fromState);
    }
    const fromSource = getValueByPath(fromObject, ['source']);
    if (fromSource != null) {
        setValueByPath(toObject, ['source'], fromSource);
    }
    const fromVideoMetadata = getValueByPath(fromObject, [
        'videoMetadata',
    ]);
    if (fromVideoMetadata != null) {
        setValueByPath(toObject, ['videoMetadata'], fromVideoMetadata);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fileStatusFromMldev(apiClient, fromError));
    }
    return toObject;
}
function listFilesResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromNextPageToken = getValueByPath(fromObject, [
        'nextPageToken',
    ]);
    if (fromNextPageToken != null) {
        setValueByPath(toObject, ['nextPageToken'], fromNextPageToken);
    }
    const fromFiles = getValueByPath(fromObject, ['files']);
    if (fromFiles != null) {
        let transformedList = fromFiles;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return fileFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['files'], transformedList);
    }
    return toObject;
}
function createFileResponseFromMldev() {
    const toObject = {};
    return toObject;
}
function deleteFileResponseFromMldev() {
    const toObject = {};
    return toObject;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Files extends BaseModule {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
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
        this.list = async (params = {}) => {
            return new Pager(PagedItem.PAGED_ITEM_FILES, (x) => this.listInternal(x), await this.listInternal(params), params);
        };
    }
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
    async upload(params) {
        if (this.apiClient.isVertexAI()) {
            throw new Error('Vertex AI does not support uploading files. You can share files through a GCS bucket.');
        }
        return this.apiClient
            .uploadFile(params.file, params.config)
            .then((response) => {
            const file = fileFromMldev(this.apiClient, response);
            return file;
        });
    }
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
    async download(params) {
        await this.apiClient.downloadFile(params);
    }
    async listInternal(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            throw new Error('This method is only supported by the Gemini Developer API.');
        }
        else {
            const body = listFilesParametersToMldev(this.apiClient, params);
            path = formatMap('files', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = listFilesResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new ListFilesResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
    async createInternal(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            throw new Error('This method is only supported by the Gemini Developer API.');
        }
        else {
            const body = createFileParametersToMldev(this.apiClient, params);
            path = formatMap('upload/v1beta/files', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then(() => {
                const resp = createFileResponseFromMldev();
                const typedResp = new CreateFileResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
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
    async get(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            throw new Error('This method is only supported by the Gemini Developer API.');
        }
        else {
            const body = getFileParametersToMldev(this.apiClient, params);
            path = formatMap('files/{file}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = fileFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
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
    async delete(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            throw new Error('This method is only supported by the Gemini Developer API.');
        }
        else {
            const body = deleteFileParametersToMldev(this.apiClient, params);
            path = formatMap('files/{file}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'DELETE',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then(() => {
                const resp = deleteFileResponseFromMldev();
                const typedResp = new DeleteFileResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function partToMldev$1(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['videoMetadata']) !== undefined) {
        throw new Error('videoMetadata parameter is not supported in Gemini API.');
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function partToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromVideoMetadata = getValueByPath(fromObject, [
        'videoMetadata',
    ]);
    if (fromVideoMetadata != null) {
        setValueByPath(toObject, ['videoMetadata'], fromVideoMetadata);
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentToMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partToMldev$1(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function contentToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partToVertex$1(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function googleSearchToMldev$1() {
    const toObject = {};
    return toObject;
}
function googleSearchToVertex$1() {
    const toObject = {};
    return toObject;
}
function dynamicRetrievalConfigToMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromDynamicThreshold = getValueByPath(fromObject, [
        'dynamicThreshold',
    ]);
    if (fromDynamicThreshold != null) {
        setValueByPath(toObject, ['dynamicThreshold'], fromDynamicThreshold);
    }
    return toObject;
}
function dynamicRetrievalConfigToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromDynamicThreshold = getValueByPath(fromObject, [
        'dynamicThreshold',
    ]);
    if (fromDynamicThreshold != null) {
        setValueByPath(toObject, ['dynamicThreshold'], fromDynamicThreshold);
    }
    return toObject;
}
function googleSearchRetrievalToMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromDynamicRetrievalConfig = getValueByPath(fromObject, [
        'dynamicRetrievalConfig',
    ]);
    if (fromDynamicRetrievalConfig != null) {
        setValueByPath(toObject, ['dynamicRetrievalConfig'], dynamicRetrievalConfigToMldev$1(apiClient, fromDynamicRetrievalConfig));
    }
    return toObject;
}
function googleSearchRetrievalToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromDynamicRetrievalConfig = getValueByPath(fromObject, [
        'dynamicRetrievalConfig',
    ]);
    if (fromDynamicRetrievalConfig != null) {
        setValueByPath(toObject, ['dynamicRetrievalConfig'], dynamicRetrievalConfigToVertex$1(apiClient, fromDynamicRetrievalConfig));
    }
    return toObject;
}
function enterpriseWebSearchToVertex$1() {
    const toObject = {};
    return toObject;
}
function apiKeyConfigToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromApiKeyString = getValueByPath(fromObject, ['apiKeyString']);
    if (fromApiKeyString != null) {
        setValueByPath(toObject, ['apiKeyString'], fromApiKeyString);
    }
    return toObject;
}
function authConfigToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromApiKeyConfig = getValueByPath(fromObject, ['apiKeyConfig']);
    if (fromApiKeyConfig != null) {
        setValueByPath(toObject, ['apiKeyConfig'], apiKeyConfigToVertex$1(apiClient, fromApiKeyConfig));
    }
    const fromAuthType = getValueByPath(fromObject, ['authType']);
    if (fromAuthType != null) {
        setValueByPath(toObject, ['authType'], fromAuthType);
    }
    const fromGoogleServiceAccountConfig = getValueByPath(fromObject, [
        'googleServiceAccountConfig',
    ]);
    if (fromGoogleServiceAccountConfig != null) {
        setValueByPath(toObject, ['googleServiceAccountConfig'], fromGoogleServiceAccountConfig);
    }
    const fromHttpBasicAuthConfig = getValueByPath(fromObject, [
        'httpBasicAuthConfig',
    ]);
    if (fromHttpBasicAuthConfig != null) {
        setValueByPath(toObject, ['httpBasicAuthConfig'], fromHttpBasicAuthConfig);
    }
    const fromOauthConfig = getValueByPath(fromObject, ['oauthConfig']);
    if (fromOauthConfig != null) {
        setValueByPath(toObject, ['oauthConfig'], fromOauthConfig);
    }
    const fromOidcConfig = getValueByPath(fromObject, ['oidcConfig']);
    if (fromOidcConfig != null) {
        setValueByPath(toObject, ['oidcConfig'], fromOidcConfig);
    }
    return toObject;
}
function googleMapsToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromAuthConfig = getValueByPath(fromObject, ['authConfig']);
    if (fromAuthConfig != null) {
        setValueByPath(toObject, ['authConfig'], authConfigToVertex$1(apiClient, fromAuthConfig));
    }
    return toObject;
}
function toolToMldev$1(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['retrieval']) !== undefined) {
        throw new Error('retrieval parameter is not supported in Gemini API.');
    }
    const fromGoogleSearch = getValueByPath(fromObject, ['googleSearch']);
    if (fromGoogleSearch != null) {
        setValueByPath(toObject, ['googleSearch'], googleSearchToMldev$1());
    }
    const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
        'googleSearchRetrieval',
    ]);
    if (fromGoogleSearchRetrieval != null) {
        setValueByPath(toObject, ['googleSearchRetrieval'], googleSearchRetrievalToMldev$1(apiClient, fromGoogleSearchRetrieval));
    }
    if (getValueByPath(fromObject, ['enterpriseWebSearch']) !== undefined) {
        throw new Error('enterpriseWebSearch parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['googleMaps']) !== undefined) {
        throw new Error('googleMaps parameter is not supported in Gemini API.');
    }
    const fromCodeExecution = getValueByPath(fromObject, [
        'codeExecution',
    ]);
    if (fromCodeExecution != null) {
        setValueByPath(toObject, ['codeExecution'], fromCodeExecution);
    }
    const fromFunctionDeclarations = getValueByPath(fromObject, [
        'functionDeclarations',
    ]);
    if (fromFunctionDeclarations != null) {
        setValueByPath(toObject, ['functionDeclarations'], fromFunctionDeclarations);
    }
    return toObject;
}
function toolToVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromRetrieval = getValueByPath(fromObject, ['retrieval']);
    if (fromRetrieval != null) {
        setValueByPath(toObject, ['retrieval'], fromRetrieval);
    }
    const fromGoogleSearch = getValueByPath(fromObject, ['googleSearch']);
    if (fromGoogleSearch != null) {
        setValueByPath(toObject, ['googleSearch'], googleSearchToVertex$1());
    }
    const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
        'googleSearchRetrieval',
    ]);
    if (fromGoogleSearchRetrieval != null) {
        setValueByPath(toObject, ['googleSearchRetrieval'], googleSearchRetrievalToVertex$1(apiClient, fromGoogleSearchRetrieval));
    }
    const fromEnterpriseWebSearch = getValueByPath(fromObject, [
        'enterpriseWebSearch',
    ]);
    if (fromEnterpriseWebSearch != null) {
        setValueByPath(toObject, ['enterpriseWebSearch'], enterpriseWebSearchToVertex$1());
    }
    const fromGoogleMaps = getValueByPath(fromObject, ['googleMaps']);
    if (fromGoogleMaps != null) {
        setValueByPath(toObject, ['googleMaps'], googleMapsToVertex$1(apiClient, fromGoogleMaps));
    }
    const fromCodeExecution = getValueByPath(fromObject, [
        'codeExecution',
    ]);
    if (fromCodeExecution != null) {
        setValueByPath(toObject, ['codeExecution'], fromCodeExecution);
    }
    const fromFunctionDeclarations = getValueByPath(fromObject, [
        'functionDeclarations',
    ]);
    if (fromFunctionDeclarations != null) {
        setValueByPath(toObject, ['functionDeclarations'], fromFunctionDeclarations);
    }
    return toObject;
}
function sessionResumptionConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromHandle = getValueByPath(fromObject, ['handle']);
    if (fromHandle != null) {
        setValueByPath(toObject, ['handle'], fromHandle);
    }
    if (getValueByPath(fromObject, ['transparent']) !== undefined) {
        throw new Error('transparent parameter is not supported in Gemini API.');
    }
    return toObject;
}
function sessionResumptionConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromHandle = getValueByPath(fromObject, ['handle']);
    if (fromHandle != null) {
        setValueByPath(toObject, ['handle'], fromHandle);
    }
    const fromTransparent = getValueByPath(fromObject, ['transparent']);
    if (fromTransparent != null) {
        setValueByPath(toObject, ['transparent'], fromTransparent);
    }
    return toObject;
}
function audioTranscriptionConfigToMldev() {
    const toObject = {};
    return toObject;
}
function audioTranscriptionConfigToVertex() {
    const toObject = {};
    return toObject;
}
function automaticActivityDetectionToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromDisabled = getValueByPath(fromObject, ['disabled']);
    if (fromDisabled != null) {
        setValueByPath(toObject, ['disabled'], fromDisabled);
    }
    const fromStartOfSpeechSensitivity = getValueByPath(fromObject, [
        'startOfSpeechSensitivity',
    ]);
    if (fromStartOfSpeechSensitivity != null) {
        setValueByPath(toObject, ['startOfSpeechSensitivity'], fromStartOfSpeechSensitivity);
    }
    const fromEndOfSpeechSensitivity = getValueByPath(fromObject, [
        'endOfSpeechSensitivity',
    ]);
    if (fromEndOfSpeechSensitivity != null) {
        setValueByPath(toObject, ['endOfSpeechSensitivity'], fromEndOfSpeechSensitivity);
    }
    const fromPrefixPaddingMs = getValueByPath(fromObject, [
        'prefixPaddingMs',
    ]);
    if (fromPrefixPaddingMs != null) {
        setValueByPath(toObject, ['prefixPaddingMs'], fromPrefixPaddingMs);
    }
    const fromSilenceDurationMs = getValueByPath(fromObject, [
        'silenceDurationMs',
    ]);
    if (fromSilenceDurationMs != null) {
        setValueByPath(toObject, ['silenceDurationMs'], fromSilenceDurationMs);
    }
    return toObject;
}
function automaticActivityDetectionToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromDisabled = getValueByPath(fromObject, ['disabled']);
    if (fromDisabled != null) {
        setValueByPath(toObject, ['disabled'], fromDisabled);
    }
    const fromStartOfSpeechSensitivity = getValueByPath(fromObject, [
        'startOfSpeechSensitivity',
    ]);
    if (fromStartOfSpeechSensitivity != null) {
        setValueByPath(toObject, ['startOfSpeechSensitivity'], fromStartOfSpeechSensitivity);
    }
    const fromEndOfSpeechSensitivity = getValueByPath(fromObject, [
        'endOfSpeechSensitivity',
    ]);
    if (fromEndOfSpeechSensitivity != null) {
        setValueByPath(toObject, ['endOfSpeechSensitivity'], fromEndOfSpeechSensitivity);
    }
    const fromPrefixPaddingMs = getValueByPath(fromObject, [
        'prefixPaddingMs',
    ]);
    if (fromPrefixPaddingMs != null) {
        setValueByPath(toObject, ['prefixPaddingMs'], fromPrefixPaddingMs);
    }
    const fromSilenceDurationMs = getValueByPath(fromObject, [
        'silenceDurationMs',
    ]);
    if (fromSilenceDurationMs != null) {
        setValueByPath(toObject, ['silenceDurationMs'], fromSilenceDurationMs);
    }
    return toObject;
}
function realtimeInputConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromAutomaticActivityDetection = getValueByPath(fromObject, [
        'automaticActivityDetection',
    ]);
    if (fromAutomaticActivityDetection != null) {
        setValueByPath(toObject, ['automaticActivityDetection'], automaticActivityDetectionToMldev(apiClient, fromAutomaticActivityDetection));
    }
    const fromActivityHandling = getValueByPath(fromObject, [
        'activityHandling',
    ]);
    if (fromActivityHandling != null) {
        setValueByPath(toObject, ['activityHandling'], fromActivityHandling);
    }
    const fromTurnCoverage = getValueByPath(fromObject, ['turnCoverage']);
    if (fromTurnCoverage != null) {
        setValueByPath(toObject, ['turnCoverage'], fromTurnCoverage);
    }
    return toObject;
}
function realtimeInputConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromAutomaticActivityDetection = getValueByPath(fromObject, [
        'automaticActivityDetection',
    ]);
    if (fromAutomaticActivityDetection != null) {
        setValueByPath(toObject, ['automaticActivityDetection'], automaticActivityDetectionToVertex(apiClient, fromAutomaticActivityDetection));
    }
    const fromActivityHandling = getValueByPath(fromObject, [
        'activityHandling',
    ]);
    if (fromActivityHandling != null) {
        setValueByPath(toObject, ['activityHandling'], fromActivityHandling);
    }
    const fromTurnCoverage = getValueByPath(fromObject, ['turnCoverage']);
    if (fromTurnCoverage != null) {
        setValueByPath(toObject, ['turnCoverage'], fromTurnCoverage);
    }
    return toObject;
}
function slidingWindowToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromTargetTokens = getValueByPath(fromObject, ['targetTokens']);
    if (fromTargetTokens != null) {
        setValueByPath(toObject, ['targetTokens'], fromTargetTokens);
    }
    return toObject;
}
function slidingWindowToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromTargetTokens = getValueByPath(fromObject, ['targetTokens']);
    if (fromTargetTokens != null) {
        setValueByPath(toObject, ['targetTokens'], fromTargetTokens);
    }
    return toObject;
}
function contextWindowCompressionConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromTriggerTokens = getValueByPath(fromObject, [
        'triggerTokens',
    ]);
    if (fromTriggerTokens != null) {
        setValueByPath(toObject, ['triggerTokens'], fromTriggerTokens);
    }
    const fromSlidingWindow = getValueByPath(fromObject, [
        'slidingWindow',
    ]);
    if (fromSlidingWindow != null) {
        setValueByPath(toObject, ['slidingWindow'], slidingWindowToMldev(apiClient, fromSlidingWindow));
    }
    return toObject;
}
function contextWindowCompressionConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromTriggerTokens = getValueByPath(fromObject, [
        'triggerTokens',
    ]);
    if (fromTriggerTokens != null) {
        setValueByPath(toObject, ['triggerTokens'], fromTriggerTokens);
    }
    const fromSlidingWindow = getValueByPath(fromObject, [
        'slidingWindow',
    ]);
    if (fromSlidingWindow != null) {
        setValueByPath(toObject, ['slidingWindow'], slidingWindowToVertex(apiClient, fromSlidingWindow));
    }
    return toObject;
}
function liveConnectConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromGenerationConfig = getValueByPath(fromObject, [
        'generationConfig',
    ]);
    if (parentObject !== undefined && fromGenerationConfig != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig'], fromGenerationConfig);
    }
    const fromResponseModalities = getValueByPath(fromObject, [
        'responseModalities',
    ]);
    if (parentObject !== undefined && fromResponseModalities != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'responseModalities'], fromResponseModalities);
    }
    const fromTemperature = getValueByPath(fromObject, ['temperature']);
    if (parentObject !== undefined && fromTemperature != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'temperature'], fromTemperature);
    }
    const fromTopP = getValueByPath(fromObject, ['topP']);
    if (parentObject !== undefined && fromTopP != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'topP'], fromTopP);
    }
    const fromTopK = getValueByPath(fromObject, ['topK']);
    if (parentObject !== undefined && fromTopK != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'topK'], fromTopK);
    }
    const fromMaxOutputTokens = getValueByPath(fromObject, [
        'maxOutputTokens',
    ]);
    if (parentObject !== undefined && fromMaxOutputTokens != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'maxOutputTokens'], fromMaxOutputTokens);
    }
    const fromMediaResolution = getValueByPath(fromObject, [
        'mediaResolution',
    ]);
    if (parentObject !== undefined && fromMediaResolution != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'mediaResolution'], fromMediaResolution);
    }
    const fromSeed = getValueByPath(fromObject, ['seed']);
    if (parentObject !== undefined && fromSeed != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'seed'], fromSeed);
    }
    const fromSpeechConfig = getValueByPath(fromObject, ['speechConfig']);
    if (parentObject !== undefined && fromSpeechConfig != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'speechConfig'], fromSpeechConfig);
    }
    const fromSystemInstruction = getValueByPath(fromObject, [
        'systemInstruction',
    ]);
    if (parentObject !== undefined && fromSystemInstruction != null) {
        setValueByPath(parentObject, ['setup', 'systemInstruction'], contentToMldev$1(apiClient, tContent(apiClient, fromSystemInstruction)));
    }
    const fromTools = getValueByPath(fromObject, ['tools']);
    if (parentObject !== undefined && fromTools != null) {
        let transformedList = tTools(apiClient, fromTools);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return toolToMldev$1(apiClient, tTool(apiClient, item));
            });
        }
        setValueByPath(parentObject, ['setup', 'tools'], transformedList);
    }
    const fromSessionResumption = getValueByPath(fromObject, [
        'sessionResumption',
    ]);
    if (parentObject !== undefined && fromSessionResumption != null) {
        setValueByPath(parentObject, ['setup', 'sessionResumption'], sessionResumptionConfigToMldev(apiClient, fromSessionResumption));
    }
    const fromInputAudioTranscription = getValueByPath(fromObject, [
        'inputAudioTranscription',
    ]);
    if (parentObject !== undefined && fromInputAudioTranscription != null) {
        setValueByPath(parentObject, ['setup', 'inputAudioTranscription'], audioTranscriptionConfigToMldev());
    }
    const fromOutputAudioTranscription = getValueByPath(fromObject, [
        'outputAudioTranscription',
    ]);
    if (parentObject !== undefined && fromOutputAudioTranscription != null) {
        setValueByPath(parentObject, ['setup', 'outputAudioTranscription'], audioTranscriptionConfigToMldev());
    }
    const fromRealtimeInputConfig = getValueByPath(fromObject, [
        'realtimeInputConfig',
    ]);
    if (parentObject !== undefined && fromRealtimeInputConfig != null) {
        setValueByPath(parentObject, ['setup', 'realtimeInputConfig'], realtimeInputConfigToMldev(apiClient, fromRealtimeInputConfig));
    }
    const fromContextWindowCompression = getValueByPath(fromObject, [
        'contextWindowCompression',
    ]);
    if (parentObject !== undefined && fromContextWindowCompression != null) {
        setValueByPath(parentObject, ['setup', 'contextWindowCompression'], contextWindowCompressionConfigToMldev(apiClient, fromContextWindowCompression));
    }
    return toObject;
}
function liveConnectConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromGenerationConfig = getValueByPath(fromObject, [
        'generationConfig',
    ]);
    if (parentObject !== undefined && fromGenerationConfig != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig'], fromGenerationConfig);
    }
    const fromResponseModalities = getValueByPath(fromObject, [
        'responseModalities',
    ]);
    if (parentObject !== undefined && fromResponseModalities != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'responseModalities'], fromResponseModalities);
    }
    const fromTemperature = getValueByPath(fromObject, ['temperature']);
    if (parentObject !== undefined && fromTemperature != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'temperature'], fromTemperature);
    }
    const fromTopP = getValueByPath(fromObject, ['topP']);
    if (parentObject !== undefined && fromTopP != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'topP'], fromTopP);
    }
    const fromTopK = getValueByPath(fromObject, ['topK']);
    if (parentObject !== undefined && fromTopK != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'topK'], fromTopK);
    }
    const fromMaxOutputTokens = getValueByPath(fromObject, [
        'maxOutputTokens',
    ]);
    if (parentObject !== undefined && fromMaxOutputTokens != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'maxOutputTokens'], fromMaxOutputTokens);
    }
    const fromMediaResolution = getValueByPath(fromObject, [
        'mediaResolution',
    ]);
    if (parentObject !== undefined && fromMediaResolution != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'mediaResolution'], fromMediaResolution);
    }
    const fromSeed = getValueByPath(fromObject, ['seed']);
    if (parentObject !== undefined && fromSeed != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'seed'], fromSeed);
    }
    const fromSpeechConfig = getValueByPath(fromObject, ['speechConfig']);
    if (parentObject !== undefined && fromSpeechConfig != null) {
        setValueByPath(parentObject, ['setup', 'generationConfig', 'speechConfig'], fromSpeechConfig);
    }
    const fromSystemInstruction = getValueByPath(fromObject, [
        'systemInstruction',
    ]);
    if (parentObject !== undefined && fromSystemInstruction != null) {
        setValueByPath(parentObject, ['setup', 'systemInstruction'], contentToVertex$1(apiClient, tContent(apiClient, fromSystemInstruction)));
    }
    const fromTools = getValueByPath(fromObject, ['tools']);
    if (parentObject !== undefined && fromTools != null) {
        let transformedList = tTools(apiClient, fromTools);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return toolToVertex$1(apiClient, tTool(apiClient, item));
            });
        }
        setValueByPath(parentObject, ['setup', 'tools'], transformedList);
    }
    const fromSessionResumption = getValueByPath(fromObject, [
        'sessionResumption',
    ]);
    if (parentObject !== undefined && fromSessionResumption != null) {
        setValueByPath(parentObject, ['setup', 'sessionResumption'], sessionResumptionConfigToVertex(apiClient, fromSessionResumption));
    }
    const fromInputAudioTranscription = getValueByPath(fromObject, [
        'inputAudioTranscription',
    ]);
    if (parentObject !== undefined && fromInputAudioTranscription != null) {
        setValueByPath(parentObject, ['setup', 'inputAudioTranscription'], audioTranscriptionConfigToVertex());
    }
    const fromOutputAudioTranscription = getValueByPath(fromObject, [
        'outputAudioTranscription',
    ]);
    if (parentObject !== undefined && fromOutputAudioTranscription != null) {
        setValueByPath(parentObject, ['setup', 'outputAudioTranscription'], audioTranscriptionConfigToVertex());
    }
    const fromRealtimeInputConfig = getValueByPath(fromObject, [
        'realtimeInputConfig',
    ]);
    if (parentObject !== undefined && fromRealtimeInputConfig != null) {
        setValueByPath(parentObject, ['setup', 'realtimeInputConfig'], realtimeInputConfigToVertex(apiClient, fromRealtimeInputConfig));
    }
    const fromContextWindowCompression = getValueByPath(fromObject, [
        'contextWindowCompression',
    ]);
    if (parentObject !== undefined && fromContextWindowCompression != null) {
        setValueByPath(parentObject, ['setup', 'contextWindowCompression'], contextWindowCompressionConfigToVertex(apiClient, fromContextWindowCompression));
    }
    return toObject;
}
function liveConnectParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['setup', 'model'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], liveConnectConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function liveConnectParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['setup', 'model'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], liveConnectConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function activityStartToMldev() {
    const toObject = {};
    return toObject;
}
function activityStartToVertex() {
    const toObject = {};
    return toObject;
}
function activityEndToMldev() {
    const toObject = {};
    return toObject;
}
function activityEndToVertex() {
    const toObject = {};
    return toObject;
}
function liveSendRealtimeInputParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromMedia = getValueByPath(fromObject, ['media']);
    if (fromMedia != null) {
        setValueByPath(toObject, ['mediaChunks'], tBlobs(apiClient, fromMedia));
    }
    const fromAudio = getValueByPath(fromObject, ['audio']);
    if (fromAudio != null) {
        setValueByPath(toObject, ['audio'], tAudioBlob(apiClient, fromAudio));
    }
    const fromAudioStreamEnd = getValueByPath(fromObject, [
        'audioStreamEnd',
    ]);
    if (fromAudioStreamEnd != null) {
        setValueByPath(toObject, ['audioStreamEnd'], fromAudioStreamEnd);
    }
    const fromVideo = getValueByPath(fromObject, ['video']);
    if (fromVideo != null) {
        setValueByPath(toObject, ['video'], tImageBlob(apiClient, fromVideo));
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    const fromActivityStart = getValueByPath(fromObject, [
        'activityStart',
    ]);
    if (fromActivityStart != null) {
        setValueByPath(toObject, ['activityStart'], activityStartToMldev());
    }
    const fromActivityEnd = getValueByPath(fromObject, ['activityEnd']);
    if (fromActivityEnd != null) {
        setValueByPath(toObject, ['activityEnd'], activityEndToMldev());
    }
    return toObject;
}
function liveSendRealtimeInputParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromMedia = getValueByPath(fromObject, ['media']);
    if (fromMedia != null) {
        setValueByPath(toObject, ['mediaChunks'], tBlobs(apiClient, fromMedia));
    }
    if (getValueByPath(fromObject, ['audio']) !== undefined) {
        throw new Error('audio parameter is not supported in Vertex AI.');
    }
    const fromAudioStreamEnd = getValueByPath(fromObject, [
        'audioStreamEnd',
    ]);
    if (fromAudioStreamEnd != null) {
        setValueByPath(toObject, ['audioStreamEnd'], fromAudioStreamEnd);
    }
    if (getValueByPath(fromObject, ['video']) !== undefined) {
        throw new Error('video parameter is not supported in Vertex AI.');
    }
    if (getValueByPath(fromObject, ['text']) !== undefined) {
        throw new Error('text parameter is not supported in Vertex AI.');
    }
    const fromActivityStart = getValueByPath(fromObject, [
        'activityStart',
    ]);
    if (fromActivityStart != null) {
        setValueByPath(toObject, ['activityStart'], activityStartToVertex());
    }
    const fromActivityEnd = getValueByPath(fromObject, ['activityEnd']);
    if (fromActivityEnd != null) {
        setValueByPath(toObject, ['activityEnd'], activityEndToVertex());
    }
    return toObject;
}
function liveServerSetupCompleteFromMldev() {
    const toObject = {};
    return toObject;
}
function liveServerSetupCompleteFromVertex() {
    const toObject = {};
    return toObject;
}
function partFromMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function partFromVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromVideoMetadata = getValueByPath(fromObject, [
        'videoMetadata',
    ]);
    if (fromVideoMetadata != null) {
        setValueByPath(toObject, ['videoMetadata'], fromVideoMetadata);
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentFromMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partFromMldev$1(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function contentFromVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partFromVertex$1(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function transcriptionFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    const fromFinished = getValueByPath(fromObject, ['finished']);
    if (fromFinished != null) {
        setValueByPath(toObject, ['finished'], fromFinished);
    }
    return toObject;
}
function transcriptionFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    const fromFinished = getValueByPath(fromObject, ['finished']);
    if (fromFinished != null) {
        setValueByPath(toObject, ['finished'], fromFinished);
    }
    return toObject;
}
function liveServerContentFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModelTurn = getValueByPath(fromObject, ['modelTurn']);
    if (fromModelTurn != null) {
        setValueByPath(toObject, ['modelTurn'], contentFromMldev$1(apiClient, fromModelTurn));
    }
    const fromTurnComplete = getValueByPath(fromObject, ['turnComplete']);
    if (fromTurnComplete != null) {
        setValueByPath(toObject, ['turnComplete'], fromTurnComplete);
    }
    const fromInterrupted = getValueByPath(fromObject, ['interrupted']);
    if (fromInterrupted != null) {
        setValueByPath(toObject, ['interrupted'], fromInterrupted);
    }
    const fromGroundingMetadata = getValueByPath(fromObject, [
        'groundingMetadata',
    ]);
    if (fromGroundingMetadata != null) {
        setValueByPath(toObject, ['groundingMetadata'], fromGroundingMetadata);
    }
    const fromGenerationComplete = getValueByPath(fromObject, [
        'generationComplete',
    ]);
    if (fromGenerationComplete != null) {
        setValueByPath(toObject, ['generationComplete'], fromGenerationComplete);
    }
    const fromInputTranscription = getValueByPath(fromObject, [
        'inputTranscription',
    ]);
    if (fromInputTranscription != null) {
        setValueByPath(toObject, ['inputTranscription'], transcriptionFromMldev(apiClient, fromInputTranscription));
    }
    const fromOutputTranscription = getValueByPath(fromObject, [
        'outputTranscription',
    ]);
    if (fromOutputTranscription != null) {
        setValueByPath(toObject, ['outputTranscription'], transcriptionFromMldev(apiClient, fromOutputTranscription));
    }
    return toObject;
}
function liveServerContentFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModelTurn = getValueByPath(fromObject, ['modelTurn']);
    if (fromModelTurn != null) {
        setValueByPath(toObject, ['modelTurn'], contentFromVertex$1(apiClient, fromModelTurn));
    }
    const fromTurnComplete = getValueByPath(fromObject, ['turnComplete']);
    if (fromTurnComplete != null) {
        setValueByPath(toObject, ['turnComplete'], fromTurnComplete);
    }
    const fromInterrupted = getValueByPath(fromObject, ['interrupted']);
    if (fromInterrupted != null) {
        setValueByPath(toObject, ['interrupted'], fromInterrupted);
    }
    const fromGroundingMetadata = getValueByPath(fromObject, [
        'groundingMetadata',
    ]);
    if (fromGroundingMetadata != null) {
        setValueByPath(toObject, ['groundingMetadata'], fromGroundingMetadata);
    }
    const fromGenerationComplete = getValueByPath(fromObject, [
        'generationComplete',
    ]);
    if (fromGenerationComplete != null) {
        setValueByPath(toObject, ['generationComplete'], fromGenerationComplete);
    }
    const fromInputTranscription = getValueByPath(fromObject, [
        'inputTranscription',
    ]);
    if (fromInputTranscription != null) {
        setValueByPath(toObject, ['inputTranscription'], transcriptionFromVertex(apiClient, fromInputTranscription));
    }
    const fromOutputTranscription = getValueByPath(fromObject, [
        'outputTranscription',
    ]);
    if (fromOutputTranscription != null) {
        setValueByPath(toObject, ['outputTranscription'], transcriptionFromVertex(apiClient, fromOutputTranscription));
    }
    return toObject;
}
function functionCallFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromId = getValueByPath(fromObject, ['id']);
    if (fromId != null) {
        setValueByPath(toObject, ['id'], fromId);
    }
    const fromArgs = getValueByPath(fromObject, ['args']);
    if (fromArgs != null) {
        setValueByPath(toObject, ['args'], fromArgs);
    }
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    return toObject;
}
function functionCallFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromArgs = getValueByPath(fromObject, ['args']);
    if (fromArgs != null) {
        setValueByPath(toObject, ['args'], fromArgs);
    }
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    return toObject;
}
function liveServerToolCallFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromFunctionCalls = getValueByPath(fromObject, [
        'functionCalls',
    ]);
    if (fromFunctionCalls != null) {
        let transformedList = fromFunctionCalls;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return functionCallFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['functionCalls'], transformedList);
    }
    return toObject;
}
function liveServerToolCallFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromFunctionCalls = getValueByPath(fromObject, [
        'functionCalls',
    ]);
    if (fromFunctionCalls != null) {
        let transformedList = fromFunctionCalls;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return functionCallFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['functionCalls'], transformedList);
    }
    return toObject;
}
function liveServerToolCallCancellationFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromIds = getValueByPath(fromObject, ['ids']);
    if (fromIds != null) {
        setValueByPath(toObject, ['ids'], fromIds);
    }
    return toObject;
}
function liveServerToolCallCancellationFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromIds = getValueByPath(fromObject, ['ids']);
    if (fromIds != null) {
        setValueByPath(toObject, ['ids'], fromIds);
    }
    return toObject;
}
function modalityTokenCountFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModality = getValueByPath(fromObject, ['modality']);
    if (fromModality != null) {
        setValueByPath(toObject, ['modality'], fromModality);
    }
    const fromTokenCount = getValueByPath(fromObject, ['tokenCount']);
    if (fromTokenCount != null) {
        setValueByPath(toObject, ['tokenCount'], fromTokenCount);
    }
    return toObject;
}
function modalityTokenCountFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModality = getValueByPath(fromObject, ['modality']);
    if (fromModality != null) {
        setValueByPath(toObject, ['modality'], fromModality);
    }
    const fromTokenCount = getValueByPath(fromObject, ['tokenCount']);
    if (fromTokenCount != null) {
        setValueByPath(toObject, ['tokenCount'], fromTokenCount);
    }
    return toObject;
}
function usageMetadataFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromPromptTokenCount = getValueByPath(fromObject, [
        'promptTokenCount',
    ]);
    if (fromPromptTokenCount != null) {
        setValueByPath(toObject, ['promptTokenCount'], fromPromptTokenCount);
    }
    const fromCachedContentTokenCount = getValueByPath(fromObject, [
        'cachedContentTokenCount',
    ]);
    if (fromCachedContentTokenCount != null) {
        setValueByPath(toObject, ['cachedContentTokenCount'], fromCachedContentTokenCount);
    }
    const fromResponseTokenCount = getValueByPath(fromObject, [
        'responseTokenCount',
    ]);
    if (fromResponseTokenCount != null) {
        setValueByPath(toObject, ['responseTokenCount'], fromResponseTokenCount);
    }
    const fromToolUsePromptTokenCount = getValueByPath(fromObject, [
        'toolUsePromptTokenCount',
    ]);
    if (fromToolUsePromptTokenCount != null) {
        setValueByPath(toObject, ['toolUsePromptTokenCount'], fromToolUsePromptTokenCount);
    }
    const fromThoughtsTokenCount = getValueByPath(fromObject, [
        'thoughtsTokenCount',
    ]);
    if (fromThoughtsTokenCount != null) {
        setValueByPath(toObject, ['thoughtsTokenCount'], fromThoughtsTokenCount);
    }
    const fromTotalTokenCount = getValueByPath(fromObject, [
        'totalTokenCount',
    ]);
    if (fromTotalTokenCount != null) {
        setValueByPath(toObject, ['totalTokenCount'], fromTotalTokenCount);
    }
    const fromPromptTokensDetails = getValueByPath(fromObject, [
        'promptTokensDetails',
    ]);
    if (fromPromptTokensDetails != null) {
        let transformedList = fromPromptTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['promptTokensDetails'], transformedList);
    }
    const fromCacheTokensDetails = getValueByPath(fromObject, [
        'cacheTokensDetails',
    ]);
    if (fromCacheTokensDetails != null) {
        let transformedList = fromCacheTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['cacheTokensDetails'], transformedList);
    }
    const fromResponseTokensDetails = getValueByPath(fromObject, [
        'responseTokensDetails',
    ]);
    if (fromResponseTokensDetails != null) {
        let transformedList = fromResponseTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['responseTokensDetails'], transformedList);
    }
    const fromToolUsePromptTokensDetails = getValueByPath(fromObject, [
        'toolUsePromptTokensDetails',
    ]);
    if (fromToolUsePromptTokensDetails != null) {
        let transformedList = fromToolUsePromptTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['toolUsePromptTokensDetails'], transformedList);
    }
    return toObject;
}
function usageMetadataFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromPromptTokenCount = getValueByPath(fromObject, [
        'promptTokenCount',
    ]);
    if (fromPromptTokenCount != null) {
        setValueByPath(toObject, ['promptTokenCount'], fromPromptTokenCount);
    }
    const fromCachedContentTokenCount = getValueByPath(fromObject, [
        'cachedContentTokenCount',
    ]);
    if (fromCachedContentTokenCount != null) {
        setValueByPath(toObject, ['cachedContentTokenCount'], fromCachedContentTokenCount);
    }
    const fromResponseTokenCount = getValueByPath(fromObject, [
        'candidatesTokenCount',
    ]);
    if (fromResponseTokenCount != null) {
        setValueByPath(toObject, ['responseTokenCount'], fromResponseTokenCount);
    }
    const fromToolUsePromptTokenCount = getValueByPath(fromObject, [
        'toolUsePromptTokenCount',
    ]);
    if (fromToolUsePromptTokenCount != null) {
        setValueByPath(toObject, ['toolUsePromptTokenCount'], fromToolUsePromptTokenCount);
    }
    const fromThoughtsTokenCount = getValueByPath(fromObject, [
        'thoughtsTokenCount',
    ]);
    if (fromThoughtsTokenCount != null) {
        setValueByPath(toObject, ['thoughtsTokenCount'], fromThoughtsTokenCount);
    }
    const fromTotalTokenCount = getValueByPath(fromObject, [
        'totalTokenCount',
    ]);
    if (fromTotalTokenCount != null) {
        setValueByPath(toObject, ['totalTokenCount'], fromTotalTokenCount);
    }
    const fromPromptTokensDetails = getValueByPath(fromObject, [
        'promptTokensDetails',
    ]);
    if (fromPromptTokensDetails != null) {
        let transformedList = fromPromptTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['promptTokensDetails'], transformedList);
    }
    const fromCacheTokensDetails = getValueByPath(fromObject, [
        'cacheTokensDetails',
    ]);
    if (fromCacheTokensDetails != null) {
        let transformedList = fromCacheTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['cacheTokensDetails'], transformedList);
    }
    const fromResponseTokensDetails = getValueByPath(fromObject, [
        'candidatesTokensDetails',
    ]);
    if (fromResponseTokensDetails != null) {
        let transformedList = fromResponseTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['responseTokensDetails'], transformedList);
    }
    const fromToolUsePromptTokensDetails = getValueByPath(fromObject, [
        'toolUsePromptTokensDetails',
    ]);
    if (fromToolUsePromptTokensDetails != null) {
        let transformedList = fromToolUsePromptTokensDetails;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modalityTokenCountFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['toolUsePromptTokensDetails'], transformedList);
    }
    const fromTrafficType = getValueByPath(fromObject, ['trafficType']);
    if (fromTrafficType != null) {
        setValueByPath(toObject, ['trafficType'], fromTrafficType);
    }
    return toObject;
}
function liveServerGoAwayFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromTimeLeft = getValueByPath(fromObject, ['timeLeft']);
    if (fromTimeLeft != null) {
        setValueByPath(toObject, ['timeLeft'], fromTimeLeft);
    }
    return toObject;
}
function liveServerGoAwayFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromTimeLeft = getValueByPath(fromObject, ['timeLeft']);
    if (fromTimeLeft != null) {
        setValueByPath(toObject, ['timeLeft'], fromTimeLeft);
    }
    return toObject;
}
function liveServerSessionResumptionUpdateFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromNewHandle = getValueByPath(fromObject, ['newHandle']);
    if (fromNewHandle != null) {
        setValueByPath(toObject, ['newHandle'], fromNewHandle);
    }
    const fromResumable = getValueByPath(fromObject, ['resumable']);
    if (fromResumable != null) {
        setValueByPath(toObject, ['resumable'], fromResumable);
    }
    const fromLastConsumedClientMessageIndex = getValueByPath(fromObject, [
        'lastConsumedClientMessageIndex',
    ]);
    if (fromLastConsumedClientMessageIndex != null) {
        setValueByPath(toObject, ['lastConsumedClientMessageIndex'], fromLastConsumedClientMessageIndex);
    }
    return toObject;
}
function liveServerSessionResumptionUpdateFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromNewHandle = getValueByPath(fromObject, ['newHandle']);
    if (fromNewHandle != null) {
        setValueByPath(toObject, ['newHandle'], fromNewHandle);
    }
    const fromResumable = getValueByPath(fromObject, ['resumable']);
    if (fromResumable != null) {
        setValueByPath(toObject, ['resumable'], fromResumable);
    }
    const fromLastConsumedClientMessageIndex = getValueByPath(fromObject, [
        'lastConsumedClientMessageIndex',
    ]);
    if (fromLastConsumedClientMessageIndex != null) {
        setValueByPath(toObject, ['lastConsumedClientMessageIndex'], fromLastConsumedClientMessageIndex);
    }
    return toObject;
}
function liveServerMessageFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromSetupComplete = getValueByPath(fromObject, [
        'setupComplete',
    ]);
    if (fromSetupComplete != null) {
        setValueByPath(toObject, ['setupComplete'], liveServerSetupCompleteFromMldev());
    }
    const fromServerContent = getValueByPath(fromObject, [
        'serverContent',
    ]);
    if (fromServerContent != null) {
        setValueByPath(toObject, ['serverContent'], liveServerContentFromMldev(apiClient, fromServerContent));
    }
    const fromToolCall = getValueByPath(fromObject, ['toolCall']);
    if (fromToolCall != null) {
        setValueByPath(toObject, ['toolCall'], liveServerToolCallFromMldev(apiClient, fromToolCall));
    }
    const fromToolCallCancellation = getValueByPath(fromObject, [
        'toolCallCancellation',
    ]);
    if (fromToolCallCancellation != null) {
        setValueByPath(toObject, ['toolCallCancellation'], liveServerToolCallCancellationFromMldev(apiClient, fromToolCallCancellation));
    }
    const fromUsageMetadata = getValueByPath(fromObject, [
        'usageMetadata',
    ]);
    if (fromUsageMetadata != null) {
        setValueByPath(toObject, ['usageMetadata'], usageMetadataFromMldev(apiClient, fromUsageMetadata));
    }
    const fromGoAway = getValueByPath(fromObject, ['goAway']);
    if (fromGoAway != null) {
        setValueByPath(toObject, ['goAway'], liveServerGoAwayFromMldev(apiClient, fromGoAway));
    }
    const fromSessionResumptionUpdate = getValueByPath(fromObject, [
        'sessionResumptionUpdate',
    ]);
    if (fromSessionResumptionUpdate != null) {
        setValueByPath(toObject, ['sessionResumptionUpdate'], liveServerSessionResumptionUpdateFromMldev(apiClient, fromSessionResumptionUpdate));
    }
    return toObject;
}
function liveServerMessageFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromSetupComplete = getValueByPath(fromObject, [
        'setupComplete',
    ]);
    if (fromSetupComplete != null) {
        setValueByPath(toObject, ['setupComplete'], liveServerSetupCompleteFromVertex());
    }
    const fromServerContent = getValueByPath(fromObject, [
        'serverContent',
    ]);
    if (fromServerContent != null) {
        setValueByPath(toObject, ['serverContent'], liveServerContentFromVertex(apiClient, fromServerContent));
    }
    const fromToolCall = getValueByPath(fromObject, ['toolCall']);
    if (fromToolCall != null) {
        setValueByPath(toObject, ['toolCall'], liveServerToolCallFromVertex(apiClient, fromToolCall));
    }
    const fromToolCallCancellation = getValueByPath(fromObject, [
        'toolCallCancellation',
    ]);
    if (fromToolCallCancellation != null) {
        setValueByPath(toObject, ['toolCallCancellation'], liveServerToolCallCancellationFromVertex(apiClient, fromToolCallCancellation));
    }
    const fromUsageMetadata = getValueByPath(fromObject, [
        'usageMetadata',
    ]);
    if (fromUsageMetadata != null) {
        setValueByPath(toObject, ['usageMetadata'], usageMetadataFromVertex(apiClient, fromUsageMetadata));
    }
    const fromGoAway = getValueByPath(fromObject, ['goAway']);
    if (fromGoAway != null) {
        setValueByPath(toObject, ['goAway'], liveServerGoAwayFromVertex(apiClient, fromGoAway));
    }
    const fromSessionResumptionUpdate = getValueByPath(fromObject, [
        'sessionResumptionUpdate',
    ]);
    if (fromSessionResumptionUpdate != null) {
        setValueByPath(toObject, ['sessionResumptionUpdate'], liveServerSessionResumptionUpdateFromVertex(apiClient, fromSessionResumptionUpdate));
    }
    return toObject;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function partToMldev(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['videoMetadata']) !== undefined) {
        throw new Error('videoMetadata parameter is not supported in Gemini API.');
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partToMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function safetySettingToMldev(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['method']) !== undefined) {
        throw new Error('method parameter is not supported in Gemini API.');
    }
    const fromCategory = getValueByPath(fromObject, ['category']);
    if (fromCategory != null) {
        setValueByPath(toObject, ['category'], fromCategory);
    }
    const fromThreshold = getValueByPath(fromObject, ['threshold']);
    if (fromThreshold != null) {
        setValueByPath(toObject, ['threshold'], fromThreshold);
    }
    return toObject;
}
function googleSearchToMldev() {
    const toObject = {};
    return toObject;
}
function dynamicRetrievalConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromDynamicThreshold = getValueByPath(fromObject, [
        'dynamicThreshold',
    ]);
    if (fromDynamicThreshold != null) {
        setValueByPath(toObject, ['dynamicThreshold'], fromDynamicThreshold);
    }
    return toObject;
}
function googleSearchRetrievalToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromDynamicRetrievalConfig = getValueByPath(fromObject, [
        'dynamicRetrievalConfig',
    ]);
    if (fromDynamicRetrievalConfig != null) {
        setValueByPath(toObject, ['dynamicRetrievalConfig'], dynamicRetrievalConfigToMldev(apiClient, fromDynamicRetrievalConfig));
    }
    return toObject;
}
function toolToMldev(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['retrieval']) !== undefined) {
        throw new Error('retrieval parameter is not supported in Gemini API.');
    }
    const fromGoogleSearch = getValueByPath(fromObject, ['googleSearch']);
    if (fromGoogleSearch != null) {
        setValueByPath(toObject, ['googleSearch'], googleSearchToMldev());
    }
    const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
        'googleSearchRetrieval',
    ]);
    if (fromGoogleSearchRetrieval != null) {
        setValueByPath(toObject, ['googleSearchRetrieval'], googleSearchRetrievalToMldev(apiClient, fromGoogleSearchRetrieval));
    }
    if (getValueByPath(fromObject, ['enterpriseWebSearch']) !== undefined) {
        throw new Error('enterpriseWebSearch parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['googleMaps']) !== undefined) {
        throw new Error('googleMaps parameter is not supported in Gemini API.');
    }
    const fromCodeExecution = getValueByPath(fromObject, [
        'codeExecution',
    ]);
    if (fromCodeExecution != null) {
        setValueByPath(toObject, ['codeExecution'], fromCodeExecution);
    }
    const fromFunctionDeclarations = getValueByPath(fromObject, [
        'functionDeclarations',
    ]);
    if (fromFunctionDeclarations != null) {
        setValueByPath(toObject, ['functionDeclarations'], fromFunctionDeclarations);
    }
    return toObject;
}
function functionCallingConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromAllowedFunctionNames = getValueByPath(fromObject, [
        'allowedFunctionNames',
    ]);
    if (fromAllowedFunctionNames != null) {
        setValueByPath(toObject, ['allowedFunctionNames'], fromAllowedFunctionNames);
    }
    return toObject;
}
function toolConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromFunctionCallingConfig = getValueByPath(fromObject, [
        'functionCallingConfig',
    ]);
    if (fromFunctionCallingConfig != null) {
        setValueByPath(toObject, ['functionCallingConfig'], functionCallingConfigToMldev(apiClient, fromFunctionCallingConfig));
    }
    if (getValueByPath(fromObject, ['retrievalConfig']) !== undefined) {
        throw new Error('retrievalConfig parameter is not supported in Gemini API.');
    }
    return toObject;
}
function prebuiltVoiceConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromVoiceName = getValueByPath(fromObject, ['voiceName']);
    if (fromVoiceName != null) {
        setValueByPath(toObject, ['voiceName'], fromVoiceName);
    }
    return toObject;
}
function voiceConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromPrebuiltVoiceConfig = getValueByPath(fromObject, [
        'prebuiltVoiceConfig',
    ]);
    if (fromPrebuiltVoiceConfig != null) {
        setValueByPath(toObject, ['prebuiltVoiceConfig'], prebuiltVoiceConfigToMldev(apiClient, fromPrebuiltVoiceConfig));
    }
    return toObject;
}
function speechConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromVoiceConfig = getValueByPath(fromObject, ['voiceConfig']);
    if (fromVoiceConfig != null) {
        setValueByPath(toObject, ['voiceConfig'], voiceConfigToMldev(apiClient, fromVoiceConfig));
    }
    const fromLanguageCode = getValueByPath(fromObject, ['languageCode']);
    if (fromLanguageCode != null) {
        setValueByPath(toObject, ['languageCode'], fromLanguageCode);
    }
    return toObject;
}
function thinkingConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromIncludeThoughts = getValueByPath(fromObject, [
        'includeThoughts',
    ]);
    if (fromIncludeThoughts != null) {
        setValueByPath(toObject, ['includeThoughts'], fromIncludeThoughts);
    }
    const fromThinkingBudget = getValueByPath(fromObject, [
        'thinkingBudget',
    ]);
    if (fromThinkingBudget != null) {
        setValueByPath(toObject, ['thinkingBudget'], fromThinkingBudget);
    }
    return toObject;
}
function generateContentConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromSystemInstruction = getValueByPath(fromObject, [
        'systemInstruction',
    ]);
    if (parentObject !== undefined && fromSystemInstruction != null) {
        setValueByPath(parentObject, ['systemInstruction'], contentToMldev(apiClient, tContent(apiClient, fromSystemInstruction)));
    }
    const fromTemperature = getValueByPath(fromObject, ['temperature']);
    if (fromTemperature != null) {
        setValueByPath(toObject, ['temperature'], fromTemperature);
    }
    const fromTopP = getValueByPath(fromObject, ['topP']);
    if (fromTopP != null) {
        setValueByPath(toObject, ['topP'], fromTopP);
    }
    const fromTopK = getValueByPath(fromObject, ['topK']);
    if (fromTopK != null) {
        setValueByPath(toObject, ['topK'], fromTopK);
    }
    const fromCandidateCount = getValueByPath(fromObject, [
        'candidateCount',
    ]);
    if (fromCandidateCount != null) {
        setValueByPath(toObject, ['candidateCount'], fromCandidateCount);
    }
    const fromMaxOutputTokens = getValueByPath(fromObject, [
        'maxOutputTokens',
    ]);
    if (fromMaxOutputTokens != null) {
        setValueByPath(toObject, ['maxOutputTokens'], fromMaxOutputTokens);
    }
    const fromStopSequences = getValueByPath(fromObject, [
        'stopSequences',
    ]);
    if (fromStopSequences != null) {
        setValueByPath(toObject, ['stopSequences'], fromStopSequences);
    }
    const fromResponseLogprobs = getValueByPath(fromObject, [
        'responseLogprobs',
    ]);
    if (fromResponseLogprobs != null) {
        setValueByPath(toObject, ['responseLogprobs'], fromResponseLogprobs);
    }
    const fromLogprobs = getValueByPath(fromObject, ['logprobs']);
    if (fromLogprobs != null) {
        setValueByPath(toObject, ['logprobs'], fromLogprobs);
    }
    const fromPresencePenalty = getValueByPath(fromObject, [
        'presencePenalty',
    ]);
    if (fromPresencePenalty != null) {
        setValueByPath(toObject, ['presencePenalty'], fromPresencePenalty);
    }
    const fromFrequencyPenalty = getValueByPath(fromObject, [
        'frequencyPenalty',
    ]);
    if (fromFrequencyPenalty != null) {
        setValueByPath(toObject, ['frequencyPenalty'], fromFrequencyPenalty);
    }
    const fromSeed = getValueByPath(fromObject, ['seed']);
    if (fromSeed != null) {
        setValueByPath(toObject, ['seed'], fromSeed);
    }
    const fromResponseMimeType = getValueByPath(fromObject, [
        'responseMimeType',
    ]);
    if (fromResponseMimeType != null) {
        setValueByPath(toObject, ['responseMimeType'], fromResponseMimeType);
    }
    const fromResponseSchema = getValueByPath(fromObject, [
        'responseSchema',
    ]);
    if (fromResponseSchema != null) {
        setValueByPath(toObject, ['responseSchema'], tSchema(apiClient, fromResponseSchema));
    }
    if (getValueByPath(fromObject, ['routingConfig']) !== undefined) {
        throw new Error('routingConfig parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['modelSelectionConfig']) !== undefined) {
        throw new Error('modelSelectionConfig parameter is not supported in Gemini API.');
    }
    const fromSafetySettings = getValueByPath(fromObject, [
        'safetySettings',
    ]);
    if (parentObject !== undefined && fromSafetySettings != null) {
        let transformedList = fromSafetySettings;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return safetySettingToMldev(apiClient, item);
            });
        }
        setValueByPath(parentObject, ['safetySettings'], transformedList);
    }
    const fromTools = getValueByPath(fromObject, ['tools']);
    if (parentObject !== undefined && fromTools != null) {
        let transformedList = tTools(apiClient, fromTools);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return toolToMldev(apiClient, tTool(apiClient, item));
            });
        }
        setValueByPath(parentObject, ['tools'], transformedList);
    }
    const fromToolConfig = getValueByPath(fromObject, ['toolConfig']);
    if (parentObject !== undefined && fromToolConfig != null) {
        setValueByPath(parentObject, ['toolConfig'], toolConfigToMldev(apiClient, fromToolConfig));
    }
    if (getValueByPath(fromObject, ['labels']) !== undefined) {
        throw new Error('labels parameter is not supported in Gemini API.');
    }
    const fromCachedContent = getValueByPath(fromObject, [
        'cachedContent',
    ]);
    if (parentObject !== undefined && fromCachedContent != null) {
        setValueByPath(parentObject, ['cachedContent'], tCachedContentName(apiClient, fromCachedContent));
    }
    const fromResponseModalities = getValueByPath(fromObject, [
        'responseModalities',
    ]);
    if (fromResponseModalities != null) {
        setValueByPath(toObject, ['responseModalities'], fromResponseModalities);
    }
    const fromMediaResolution = getValueByPath(fromObject, [
        'mediaResolution',
    ]);
    if (fromMediaResolution != null) {
        setValueByPath(toObject, ['mediaResolution'], fromMediaResolution);
    }
    const fromSpeechConfig = getValueByPath(fromObject, ['speechConfig']);
    if (fromSpeechConfig != null) {
        setValueByPath(toObject, ['speechConfig'], speechConfigToMldev(apiClient, tSpeechConfig(apiClient, fromSpeechConfig)));
    }
    if (getValueByPath(fromObject, ['audioTimestamp']) !== undefined) {
        throw new Error('audioTimestamp parameter is not supported in Gemini API.');
    }
    const fromThinkingConfig = getValueByPath(fromObject, [
        'thinkingConfig',
    ]);
    if (fromThinkingConfig != null) {
        setValueByPath(toObject, ['thinkingConfig'], thinkingConfigToMldev(apiClient, fromThinkingConfig));
    }
    return toObject;
}
function generateContentParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (fromContents != null) {
        let transformedList = tContents(apiClient, fromContents);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentToMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['contents'], transformedList);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['generationConfig'], generateContentConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function embedContentConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromTaskType = getValueByPath(fromObject, ['taskType']);
    if (parentObject !== undefined && fromTaskType != null) {
        setValueByPath(parentObject, ['requests[]', 'taskType'], fromTaskType);
    }
    const fromTitle = getValueByPath(fromObject, ['title']);
    if (parentObject !== undefined && fromTitle != null) {
        setValueByPath(parentObject, ['requests[]', 'title'], fromTitle);
    }
    const fromOutputDimensionality = getValueByPath(fromObject, [
        'outputDimensionality',
    ]);
    if (parentObject !== undefined && fromOutputDimensionality != null) {
        setValueByPath(parentObject, ['requests[]', 'outputDimensionality'], fromOutputDimensionality);
    }
    if (getValueByPath(fromObject, ['mimeType']) !== undefined) {
        throw new Error('mimeType parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['autoTruncate']) !== undefined) {
        throw new Error('autoTruncate parameter is not supported in Gemini API.');
    }
    return toObject;
}
function embedContentParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (fromContents != null) {
        setValueByPath(toObject, ['requests[]', 'content'], tContentsForEmbed(apiClient, fromContents));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], embedContentConfigToMldev(apiClient, fromConfig, toObject));
    }
    const fromModelForEmbedContent = getValueByPath(fromObject, ['model']);
    if (fromModelForEmbedContent !== undefined) {
        setValueByPath(toObject, ['requests[]', 'model'], tModel(apiClient, fromModelForEmbedContent));
    }
    return toObject;
}
function generateImagesConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['outputGcsUri']) !== undefined) {
        throw new Error('outputGcsUri parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['negativePrompt']) !== undefined) {
        throw new Error('negativePrompt parameter is not supported in Gemini API.');
    }
    const fromNumberOfImages = getValueByPath(fromObject, [
        'numberOfImages',
    ]);
    if (parentObject !== undefined && fromNumberOfImages != null) {
        setValueByPath(parentObject, ['parameters', 'sampleCount'], fromNumberOfImages);
    }
    const fromAspectRatio = getValueByPath(fromObject, ['aspectRatio']);
    if (parentObject !== undefined && fromAspectRatio != null) {
        setValueByPath(parentObject, ['parameters', 'aspectRatio'], fromAspectRatio);
    }
    const fromGuidanceScale = getValueByPath(fromObject, [
        'guidanceScale',
    ]);
    if (parentObject !== undefined && fromGuidanceScale != null) {
        setValueByPath(parentObject, ['parameters', 'guidanceScale'], fromGuidanceScale);
    }
    if (getValueByPath(fromObject, ['seed']) !== undefined) {
        throw new Error('seed parameter is not supported in Gemini API.');
    }
    const fromSafetyFilterLevel = getValueByPath(fromObject, [
        'safetyFilterLevel',
    ]);
    if (parentObject !== undefined && fromSafetyFilterLevel != null) {
        setValueByPath(parentObject, ['parameters', 'safetySetting'], fromSafetyFilterLevel);
    }
    const fromPersonGeneration = getValueByPath(fromObject, [
        'personGeneration',
    ]);
    if (parentObject !== undefined && fromPersonGeneration != null) {
        setValueByPath(parentObject, ['parameters', 'personGeneration'], fromPersonGeneration);
    }
    const fromIncludeSafetyAttributes = getValueByPath(fromObject, [
        'includeSafetyAttributes',
    ]);
    if (parentObject !== undefined && fromIncludeSafetyAttributes != null) {
        setValueByPath(parentObject, ['parameters', 'includeSafetyAttributes'], fromIncludeSafetyAttributes);
    }
    const fromIncludeRaiReason = getValueByPath(fromObject, [
        'includeRaiReason',
    ]);
    if (parentObject !== undefined && fromIncludeRaiReason != null) {
        setValueByPath(parentObject, ['parameters', 'includeRaiReason'], fromIncludeRaiReason);
    }
    const fromLanguage = getValueByPath(fromObject, ['language']);
    if (parentObject !== undefined && fromLanguage != null) {
        setValueByPath(parentObject, ['parameters', 'language'], fromLanguage);
    }
    const fromOutputMimeType = getValueByPath(fromObject, [
        'outputMimeType',
    ]);
    if (parentObject !== undefined && fromOutputMimeType != null) {
        setValueByPath(parentObject, ['parameters', 'outputOptions', 'mimeType'], fromOutputMimeType);
    }
    const fromOutputCompressionQuality = getValueByPath(fromObject, [
        'outputCompressionQuality',
    ]);
    if (parentObject !== undefined && fromOutputCompressionQuality != null) {
        setValueByPath(parentObject, ['parameters', 'outputOptions', 'compressionQuality'], fromOutputCompressionQuality);
    }
    if (getValueByPath(fromObject, ['addWatermark']) !== undefined) {
        throw new Error('addWatermark parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['enhancePrompt']) !== undefined) {
        throw new Error('enhancePrompt parameter is not supported in Gemini API.');
    }
    return toObject;
}
function generateImagesParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromPrompt = getValueByPath(fromObject, ['prompt']);
    if (fromPrompt != null) {
        setValueByPath(toObject, ['instances[0]', 'prompt'], fromPrompt);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], generateImagesConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function getModelParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'name'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function listModelsConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromPageSize = getValueByPath(fromObject, ['pageSize']);
    if (parentObject !== undefined && fromPageSize != null) {
        setValueByPath(parentObject, ['_query', 'pageSize'], fromPageSize);
    }
    const fromPageToken = getValueByPath(fromObject, ['pageToken']);
    if (parentObject !== undefined && fromPageToken != null) {
        setValueByPath(parentObject, ['_query', 'pageToken'], fromPageToken);
    }
    const fromFilter = getValueByPath(fromObject, ['filter']);
    if (parentObject !== undefined && fromFilter != null) {
        setValueByPath(parentObject, ['_query', 'filter'], fromFilter);
    }
    const fromQueryBase = getValueByPath(fromObject, ['queryBase']);
    if (parentObject !== undefined && fromQueryBase != null) {
        setValueByPath(parentObject, ['_url', 'models_url'], tModelsUrl(apiClient, fromQueryBase));
    }
    return toObject;
}
function listModelsParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], listModelsConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function updateModelConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (parentObject !== undefined && fromDisplayName != null) {
        setValueByPath(parentObject, ['displayName'], fromDisplayName);
    }
    const fromDescription = getValueByPath(fromObject, ['description']);
    if (parentObject !== undefined && fromDescription != null) {
        setValueByPath(parentObject, ['description'], fromDescription);
    }
    return toObject;
}
function updateModelParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'name'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], updateModelConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function deleteModelParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'name'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function countTokensConfigToMldev(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['systemInstruction']) !== undefined) {
        throw new Error('systemInstruction parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['tools']) !== undefined) {
        throw new Error('tools parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['generationConfig']) !== undefined) {
        throw new Error('generationConfig parameter is not supported in Gemini API.');
    }
    return toObject;
}
function countTokensParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (fromContents != null) {
        let transformedList = tContents(apiClient, fromContents);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentToMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['contents'], transformedList);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], countTokensConfigToMldev(apiClient, fromConfig));
    }
    return toObject;
}
function imageToMldev(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['gcsUri']) !== undefined) {
        throw new Error('gcsUri parameter is not supported in Gemini API.');
    }
    const fromImageBytes = getValueByPath(fromObject, ['imageBytes']);
    if (fromImageBytes != null) {
        setValueByPath(toObject, ['bytesBase64Encoded'], tBytes(apiClient, fromImageBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function generateVideosConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromNumberOfVideos = getValueByPath(fromObject, [
        'numberOfVideos',
    ]);
    if (parentObject !== undefined && fromNumberOfVideos != null) {
        setValueByPath(parentObject, ['parameters', 'sampleCount'], fromNumberOfVideos);
    }
    if (getValueByPath(fromObject, ['outputGcsUri']) !== undefined) {
        throw new Error('outputGcsUri parameter is not supported in Gemini API.');
    }
    if (getValueByPath(fromObject, ['fps']) !== undefined) {
        throw new Error('fps parameter is not supported in Gemini API.');
    }
    const fromDurationSeconds = getValueByPath(fromObject, [
        'durationSeconds',
    ]);
    if (parentObject !== undefined && fromDurationSeconds != null) {
        setValueByPath(parentObject, ['parameters', 'durationSeconds'], fromDurationSeconds);
    }
    if (getValueByPath(fromObject, ['seed']) !== undefined) {
        throw new Error('seed parameter is not supported in Gemini API.');
    }
    const fromAspectRatio = getValueByPath(fromObject, ['aspectRatio']);
    if (parentObject !== undefined && fromAspectRatio != null) {
        setValueByPath(parentObject, ['parameters', 'aspectRatio'], fromAspectRatio);
    }
    if (getValueByPath(fromObject, ['resolution']) !== undefined) {
        throw new Error('resolution parameter is not supported in Gemini API.');
    }
    const fromPersonGeneration = getValueByPath(fromObject, [
        'personGeneration',
    ]);
    if (parentObject !== undefined && fromPersonGeneration != null) {
        setValueByPath(parentObject, ['parameters', 'personGeneration'], fromPersonGeneration);
    }
    if (getValueByPath(fromObject, ['pubsubTopic']) !== undefined) {
        throw new Error('pubsubTopic parameter is not supported in Gemini API.');
    }
    const fromNegativePrompt = getValueByPath(fromObject, [
        'negativePrompt',
    ]);
    if (parentObject !== undefined && fromNegativePrompt != null) {
        setValueByPath(parentObject, ['parameters', 'negativePrompt'], fromNegativePrompt);
    }
    if (getValueByPath(fromObject, ['enhancePrompt']) !== undefined) {
        throw new Error('enhancePrompt parameter is not supported in Gemini API.');
    }
    return toObject;
}
function generateVideosParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromPrompt = getValueByPath(fromObject, ['prompt']);
    if (fromPrompt != null) {
        setValueByPath(toObject, ['instances[0]', 'prompt'], fromPrompt);
    }
    const fromImage = getValueByPath(fromObject, ['image']);
    if (fromImage != null) {
        setValueByPath(toObject, ['instances[0]', 'image'], imageToMldev(apiClient, fromImage));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], generateVideosConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function partToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromVideoMetadata = getValueByPath(fromObject, [
        'videoMetadata',
    ]);
    if (fromVideoMetadata != null) {
        setValueByPath(toObject, ['videoMetadata'], fromVideoMetadata);
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partToVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function modelSelectionConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromFeatureSelectionPreference = getValueByPath(fromObject, [
        'featureSelectionPreference',
    ]);
    if (fromFeatureSelectionPreference != null) {
        setValueByPath(toObject, ['featureSelectionPreference'], fromFeatureSelectionPreference);
    }
    return toObject;
}
function safetySettingToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromMethod = getValueByPath(fromObject, ['method']);
    if (fromMethod != null) {
        setValueByPath(toObject, ['method'], fromMethod);
    }
    const fromCategory = getValueByPath(fromObject, ['category']);
    if (fromCategory != null) {
        setValueByPath(toObject, ['category'], fromCategory);
    }
    const fromThreshold = getValueByPath(fromObject, ['threshold']);
    if (fromThreshold != null) {
        setValueByPath(toObject, ['threshold'], fromThreshold);
    }
    return toObject;
}
function googleSearchToVertex() {
    const toObject = {};
    return toObject;
}
function dynamicRetrievalConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromDynamicThreshold = getValueByPath(fromObject, [
        'dynamicThreshold',
    ]);
    if (fromDynamicThreshold != null) {
        setValueByPath(toObject, ['dynamicThreshold'], fromDynamicThreshold);
    }
    return toObject;
}
function googleSearchRetrievalToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromDynamicRetrievalConfig = getValueByPath(fromObject, [
        'dynamicRetrievalConfig',
    ]);
    if (fromDynamicRetrievalConfig != null) {
        setValueByPath(toObject, ['dynamicRetrievalConfig'], dynamicRetrievalConfigToVertex(apiClient, fromDynamicRetrievalConfig));
    }
    return toObject;
}
function enterpriseWebSearchToVertex() {
    const toObject = {};
    return toObject;
}
function apiKeyConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromApiKeyString = getValueByPath(fromObject, ['apiKeyString']);
    if (fromApiKeyString != null) {
        setValueByPath(toObject, ['apiKeyString'], fromApiKeyString);
    }
    return toObject;
}
function authConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromApiKeyConfig = getValueByPath(fromObject, ['apiKeyConfig']);
    if (fromApiKeyConfig != null) {
        setValueByPath(toObject, ['apiKeyConfig'], apiKeyConfigToVertex(apiClient, fromApiKeyConfig));
    }
    const fromAuthType = getValueByPath(fromObject, ['authType']);
    if (fromAuthType != null) {
        setValueByPath(toObject, ['authType'], fromAuthType);
    }
    const fromGoogleServiceAccountConfig = getValueByPath(fromObject, [
        'googleServiceAccountConfig',
    ]);
    if (fromGoogleServiceAccountConfig != null) {
        setValueByPath(toObject, ['googleServiceAccountConfig'], fromGoogleServiceAccountConfig);
    }
    const fromHttpBasicAuthConfig = getValueByPath(fromObject, [
        'httpBasicAuthConfig',
    ]);
    if (fromHttpBasicAuthConfig != null) {
        setValueByPath(toObject, ['httpBasicAuthConfig'], fromHttpBasicAuthConfig);
    }
    const fromOauthConfig = getValueByPath(fromObject, ['oauthConfig']);
    if (fromOauthConfig != null) {
        setValueByPath(toObject, ['oauthConfig'], fromOauthConfig);
    }
    const fromOidcConfig = getValueByPath(fromObject, ['oidcConfig']);
    if (fromOidcConfig != null) {
        setValueByPath(toObject, ['oidcConfig'], fromOidcConfig);
    }
    return toObject;
}
function googleMapsToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromAuthConfig = getValueByPath(fromObject, ['authConfig']);
    if (fromAuthConfig != null) {
        setValueByPath(toObject, ['authConfig'], authConfigToVertex(apiClient, fromAuthConfig));
    }
    return toObject;
}
function toolToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromRetrieval = getValueByPath(fromObject, ['retrieval']);
    if (fromRetrieval != null) {
        setValueByPath(toObject, ['retrieval'], fromRetrieval);
    }
    const fromGoogleSearch = getValueByPath(fromObject, ['googleSearch']);
    if (fromGoogleSearch != null) {
        setValueByPath(toObject, ['googleSearch'], googleSearchToVertex());
    }
    const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
        'googleSearchRetrieval',
    ]);
    if (fromGoogleSearchRetrieval != null) {
        setValueByPath(toObject, ['googleSearchRetrieval'], googleSearchRetrievalToVertex(apiClient, fromGoogleSearchRetrieval));
    }
    const fromEnterpriseWebSearch = getValueByPath(fromObject, [
        'enterpriseWebSearch',
    ]);
    if (fromEnterpriseWebSearch != null) {
        setValueByPath(toObject, ['enterpriseWebSearch'], enterpriseWebSearchToVertex());
    }
    const fromGoogleMaps = getValueByPath(fromObject, ['googleMaps']);
    if (fromGoogleMaps != null) {
        setValueByPath(toObject, ['googleMaps'], googleMapsToVertex(apiClient, fromGoogleMaps));
    }
    const fromCodeExecution = getValueByPath(fromObject, [
        'codeExecution',
    ]);
    if (fromCodeExecution != null) {
        setValueByPath(toObject, ['codeExecution'], fromCodeExecution);
    }
    const fromFunctionDeclarations = getValueByPath(fromObject, [
        'functionDeclarations',
    ]);
    if (fromFunctionDeclarations != null) {
        setValueByPath(toObject, ['functionDeclarations'], fromFunctionDeclarations);
    }
    return toObject;
}
function functionCallingConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromMode = getValueByPath(fromObject, ['mode']);
    if (fromMode != null) {
        setValueByPath(toObject, ['mode'], fromMode);
    }
    const fromAllowedFunctionNames = getValueByPath(fromObject, [
        'allowedFunctionNames',
    ]);
    if (fromAllowedFunctionNames != null) {
        setValueByPath(toObject, ['allowedFunctionNames'], fromAllowedFunctionNames);
    }
    return toObject;
}
function latLngToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromLatitude = getValueByPath(fromObject, ['latitude']);
    if (fromLatitude != null) {
        setValueByPath(toObject, ['latitude'], fromLatitude);
    }
    const fromLongitude = getValueByPath(fromObject, ['longitude']);
    if (fromLongitude != null) {
        setValueByPath(toObject, ['longitude'], fromLongitude);
    }
    return toObject;
}
function retrievalConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromLatLng = getValueByPath(fromObject, ['latLng']);
    if (fromLatLng != null) {
        setValueByPath(toObject, ['latLng'], latLngToVertex(apiClient, fromLatLng));
    }
    return toObject;
}
function toolConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromFunctionCallingConfig = getValueByPath(fromObject, [
        'functionCallingConfig',
    ]);
    if (fromFunctionCallingConfig != null) {
        setValueByPath(toObject, ['functionCallingConfig'], functionCallingConfigToVertex(apiClient, fromFunctionCallingConfig));
    }
    const fromRetrievalConfig = getValueByPath(fromObject, [
        'retrievalConfig',
    ]);
    if (fromRetrievalConfig != null) {
        setValueByPath(toObject, ['retrievalConfig'], retrievalConfigToVertex(apiClient, fromRetrievalConfig));
    }
    return toObject;
}
function prebuiltVoiceConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromVoiceName = getValueByPath(fromObject, ['voiceName']);
    if (fromVoiceName != null) {
        setValueByPath(toObject, ['voiceName'], fromVoiceName);
    }
    return toObject;
}
function voiceConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromPrebuiltVoiceConfig = getValueByPath(fromObject, [
        'prebuiltVoiceConfig',
    ]);
    if (fromPrebuiltVoiceConfig != null) {
        setValueByPath(toObject, ['prebuiltVoiceConfig'], prebuiltVoiceConfigToVertex(apiClient, fromPrebuiltVoiceConfig));
    }
    return toObject;
}
function speechConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromVoiceConfig = getValueByPath(fromObject, ['voiceConfig']);
    if (fromVoiceConfig != null) {
        setValueByPath(toObject, ['voiceConfig'], voiceConfigToVertex(apiClient, fromVoiceConfig));
    }
    const fromLanguageCode = getValueByPath(fromObject, ['languageCode']);
    if (fromLanguageCode != null) {
        setValueByPath(toObject, ['languageCode'], fromLanguageCode);
    }
    return toObject;
}
function thinkingConfigToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromIncludeThoughts = getValueByPath(fromObject, [
        'includeThoughts',
    ]);
    if (fromIncludeThoughts != null) {
        setValueByPath(toObject, ['includeThoughts'], fromIncludeThoughts);
    }
    const fromThinkingBudget = getValueByPath(fromObject, [
        'thinkingBudget',
    ]);
    if (fromThinkingBudget != null) {
        setValueByPath(toObject, ['thinkingBudget'], fromThinkingBudget);
    }
    return toObject;
}
function generateContentConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromSystemInstruction = getValueByPath(fromObject, [
        'systemInstruction',
    ]);
    if (parentObject !== undefined && fromSystemInstruction != null) {
        setValueByPath(parentObject, ['systemInstruction'], contentToVertex(apiClient, tContent(apiClient, fromSystemInstruction)));
    }
    const fromTemperature = getValueByPath(fromObject, ['temperature']);
    if (fromTemperature != null) {
        setValueByPath(toObject, ['temperature'], fromTemperature);
    }
    const fromTopP = getValueByPath(fromObject, ['topP']);
    if (fromTopP != null) {
        setValueByPath(toObject, ['topP'], fromTopP);
    }
    const fromTopK = getValueByPath(fromObject, ['topK']);
    if (fromTopK != null) {
        setValueByPath(toObject, ['topK'], fromTopK);
    }
    const fromCandidateCount = getValueByPath(fromObject, [
        'candidateCount',
    ]);
    if (fromCandidateCount != null) {
        setValueByPath(toObject, ['candidateCount'], fromCandidateCount);
    }
    const fromMaxOutputTokens = getValueByPath(fromObject, [
        'maxOutputTokens',
    ]);
    if (fromMaxOutputTokens != null) {
        setValueByPath(toObject, ['maxOutputTokens'], fromMaxOutputTokens);
    }
    const fromStopSequences = getValueByPath(fromObject, [
        'stopSequences',
    ]);
    if (fromStopSequences != null) {
        setValueByPath(toObject, ['stopSequences'], fromStopSequences);
    }
    const fromResponseLogprobs = getValueByPath(fromObject, [
        'responseLogprobs',
    ]);
    if (fromResponseLogprobs != null) {
        setValueByPath(toObject, ['responseLogprobs'], fromResponseLogprobs);
    }
    const fromLogprobs = getValueByPath(fromObject, ['logprobs']);
    if (fromLogprobs != null) {
        setValueByPath(toObject, ['logprobs'], fromLogprobs);
    }
    const fromPresencePenalty = getValueByPath(fromObject, [
        'presencePenalty',
    ]);
    if (fromPresencePenalty != null) {
        setValueByPath(toObject, ['presencePenalty'], fromPresencePenalty);
    }
    const fromFrequencyPenalty = getValueByPath(fromObject, [
        'frequencyPenalty',
    ]);
    if (fromFrequencyPenalty != null) {
        setValueByPath(toObject, ['frequencyPenalty'], fromFrequencyPenalty);
    }
    const fromSeed = getValueByPath(fromObject, ['seed']);
    if (fromSeed != null) {
        setValueByPath(toObject, ['seed'], fromSeed);
    }
    const fromResponseMimeType = getValueByPath(fromObject, [
        'responseMimeType',
    ]);
    if (fromResponseMimeType != null) {
        setValueByPath(toObject, ['responseMimeType'], fromResponseMimeType);
    }
    const fromResponseSchema = getValueByPath(fromObject, [
        'responseSchema',
    ]);
    if (fromResponseSchema != null) {
        setValueByPath(toObject, ['responseSchema'], tSchema(apiClient, fromResponseSchema));
    }
    const fromRoutingConfig = getValueByPath(fromObject, [
        'routingConfig',
    ]);
    if (fromRoutingConfig != null) {
        setValueByPath(toObject, ['routingConfig'], fromRoutingConfig);
    }
    const fromModelSelectionConfig = getValueByPath(fromObject, [
        'modelSelectionConfig',
    ]);
    if (fromModelSelectionConfig != null) {
        setValueByPath(toObject, ['modelConfig'], modelSelectionConfigToVertex(apiClient, fromModelSelectionConfig));
    }
    const fromSafetySettings = getValueByPath(fromObject, [
        'safetySettings',
    ]);
    if (parentObject !== undefined && fromSafetySettings != null) {
        let transformedList = fromSafetySettings;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return safetySettingToVertex(apiClient, item);
            });
        }
        setValueByPath(parentObject, ['safetySettings'], transformedList);
    }
    const fromTools = getValueByPath(fromObject, ['tools']);
    if (parentObject !== undefined && fromTools != null) {
        let transformedList = tTools(apiClient, fromTools);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return toolToVertex(apiClient, tTool(apiClient, item));
            });
        }
        setValueByPath(parentObject, ['tools'], transformedList);
    }
    const fromToolConfig = getValueByPath(fromObject, ['toolConfig']);
    if (parentObject !== undefined && fromToolConfig != null) {
        setValueByPath(parentObject, ['toolConfig'], toolConfigToVertex(apiClient, fromToolConfig));
    }
    const fromLabels = getValueByPath(fromObject, ['labels']);
    if (parentObject !== undefined && fromLabels != null) {
        setValueByPath(parentObject, ['labels'], fromLabels);
    }
    const fromCachedContent = getValueByPath(fromObject, [
        'cachedContent',
    ]);
    if (parentObject !== undefined && fromCachedContent != null) {
        setValueByPath(parentObject, ['cachedContent'], tCachedContentName(apiClient, fromCachedContent));
    }
    const fromResponseModalities = getValueByPath(fromObject, [
        'responseModalities',
    ]);
    if (fromResponseModalities != null) {
        setValueByPath(toObject, ['responseModalities'], fromResponseModalities);
    }
    const fromMediaResolution = getValueByPath(fromObject, [
        'mediaResolution',
    ]);
    if (fromMediaResolution != null) {
        setValueByPath(toObject, ['mediaResolution'], fromMediaResolution);
    }
    const fromSpeechConfig = getValueByPath(fromObject, ['speechConfig']);
    if (fromSpeechConfig != null) {
        setValueByPath(toObject, ['speechConfig'], speechConfigToVertex(apiClient, tSpeechConfig(apiClient, fromSpeechConfig)));
    }
    const fromAudioTimestamp = getValueByPath(fromObject, [
        'audioTimestamp',
    ]);
    if (fromAudioTimestamp != null) {
        setValueByPath(toObject, ['audioTimestamp'], fromAudioTimestamp);
    }
    const fromThinkingConfig = getValueByPath(fromObject, [
        'thinkingConfig',
    ]);
    if (fromThinkingConfig != null) {
        setValueByPath(toObject, ['thinkingConfig'], thinkingConfigToVertex(apiClient, fromThinkingConfig));
    }
    return toObject;
}
function generateContentParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (fromContents != null) {
        let transformedList = tContents(apiClient, fromContents);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentToVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['contents'], transformedList);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['generationConfig'], generateContentConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function embedContentConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromTaskType = getValueByPath(fromObject, ['taskType']);
    if (parentObject !== undefined && fromTaskType != null) {
        setValueByPath(parentObject, ['instances[]', 'task_type'], fromTaskType);
    }
    const fromTitle = getValueByPath(fromObject, ['title']);
    if (parentObject !== undefined && fromTitle != null) {
        setValueByPath(parentObject, ['instances[]', 'title'], fromTitle);
    }
    const fromOutputDimensionality = getValueByPath(fromObject, [
        'outputDimensionality',
    ]);
    if (parentObject !== undefined && fromOutputDimensionality != null) {
        setValueByPath(parentObject, ['parameters', 'outputDimensionality'], fromOutputDimensionality);
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (parentObject !== undefined && fromMimeType != null) {
        setValueByPath(parentObject, ['instances[]', 'mimeType'], fromMimeType);
    }
    const fromAutoTruncate = getValueByPath(fromObject, ['autoTruncate']);
    if (parentObject !== undefined && fromAutoTruncate != null) {
        setValueByPath(parentObject, ['parameters', 'autoTruncate'], fromAutoTruncate);
    }
    return toObject;
}
function embedContentParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (fromContents != null) {
        setValueByPath(toObject, ['instances[]', 'content'], tContentsForEmbed(apiClient, fromContents));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], embedContentConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function generateImagesConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromOutputGcsUri = getValueByPath(fromObject, ['outputGcsUri']);
    if (parentObject !== undefined && fromOutputGcsUri != null) {
        setValueByPath(parentObject, ['parameters', 'storageUri'], fromOutputGcsUri);
    }
    const fromNegativePrompt = getValueByPath(fromObject, [
        'negativePrompt',
    ]);
    if (parentObject !== undefined && fromNegativePrompt != null) {
        setValueByPath(parentObject, ['parameters', 'negativePrompt'], fromNegativePrompt);
    }
    const fromNumberOfImages = getValueByPath(fromObject, [
        'numberOfImages',
    ]);
    if (parentObject !== undefined && fromNumberOfImages != null) {
        setValueByPath(parentObject, ['parameters', 'sampleCount'], fromNumberOfImages);
    }
    const fromAspectRatio = getValueByPath(fromObject, ['aspectRatio']);
    if (parentObject !== undefined && fromAspectRatio != null) {
        setValueByPath(parentObject, ['parameters', 'aspectRatio'], fromAspectRatio);
    }
    const fromGuidanceScale = getValueByPath(fromObject, [
        'guidanceScale',
    ]);
    if (parentObject !== undefined && fromGuidanceScale != null) {
        setValueByPath(parentObject, ['parameters', 'guidanceScale'], fromGuidanceScale);
    }
    const fromSeed = getValueByPath(fromObject, ['seed']);
    if (parentObject !== undefined && fromSeed != null) {
        setValueByPath(parentObject, ['parameters', 'seed'], fromSeed);
    }
    const fromSafetyFilterLevel = getValueByPath(fromObject, [
        'safetyFilterLevel',
    ]);
    if (parentObject !== undefined && fromSafetyFilterLevel != null) {
        setValueByPath(parentObject, ['parameters', 'safetySetting'], fromSafetyFilterLevel);
    }
    const fromPersonGeneration = getValueByPath(fromObject, [
        'personGeneration',
    ]);
    if (parentObject !== undefined && fromPersonGeneration != null) {
        setValueByPath(parentObject, ['parameters', 'personGeneration'], fromPersonGeneration);
    }
    const fromIncludeSafetyAttributes = getValueByPath(fromObject, [
        'includeSafetyAttributes',
    ]);
    if (parentObject !== undefined && fromIncludeSafetyAttributes != null) {
        setValueByPath(parentObject, ['parameters', 'includeSafetyAttributes'], fromIncludeSafetyAttributes);
    }
    const fromIncludeRaiReason = getValueByPath(fromObject, [
        'includeRaiReason',
    ]);
    if (parentObject !== undefined && fromIncludeRaiReason != null) {
        setValueByPath(parentObject, ['parameters', 'includeRaiReason'], fromIncludeRaiReason);
    }
    const fromLanguage = getValueByPath(fromObject, ['language']);
    if (parentObject !== undefined && fromLanguage != null) {
        setValueByPath(parentObject, ['parameters', 'language'], fromLanguage);
    }
    const fromOutputMimeType = getValueByPath(fromObject, [
        'outputMimeType',
    ]);
    if (parentObject !== undefined && fromOutputMimeType != null) {
        setValueByPath(parentObject, ['parameters', 'outputOptions', 'mimeType'], fromOutputMimeType);
    }
    const fromOutputCompressionQuality = getValueByPath(fromObject, [
        'outputCompressionQuality',
    ]);
    if (parentObject !== undefined && fromOutputCompressionQuality != null) {
        setValueByPath(parentObject, ['parameters', 'outputOptions', 'compressionQuality'], fromOutputCompressionQuality);
    }
    const fromAddWatermark = getValueByPath(fromObject, ['addWatermark']);
    if (parentObject !== undefined && fromAddWatermark != null) {
        setValueByPath(parentObject, ['parameters', 'addWatermark'], fromAddWatermark);
    }
    const fromEnhancePrompt = getValueByPath(fromObject, [
        'enhancePrompt',
    ]);
    if (parentObject !== undefined && fromEnhancePrompt != null) {
        setValueByPath(parentObject, ['parameters', 'enhancePrompt'], fromEnhancePrompt);
    }
    return toObject;
}
function generateImagesParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromPrompt = getValueByPath(fromObject, ['prompt']);
    if (fromPrompt != null) {
        setValueByPath(toObject, ['instances[0]', 'prompt'], fromPrompt);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], generateImagesConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function getModelParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'name'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function listModelsConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromPageSize = getValueByPath(fromObject, ['pageSize']);
    if (parentObject !== undefined && fromPageSize != null) {
        setValueByPath(parentObject, ['_query', 'pageSize'], fromPageSize);
    }
    const fromPageToken = getValueByPath(fromObject, ['pageToken']);
    if (parentObject !== undefined && fromPageToken != null) {
        setValueByPath(parentObject, ['_query', 'pageToken'], fromPageToken);
    }
    const fromFilter = getValueByPath(fromObject, ['filter']);
    if (parentObject !== undefined && fromFilter != null) {
        setValueByPath(parentObject, ['_query', 'filter'], fromFilter);
    }
    const fromQueryBase = getValueByPath(fromObject, ['queryBase']);
    if (parentObject !== undefined && fromQueryBase != null) {
        setValueByPath(parentObject, ['_url', 'models_url'], tModelsUrl(apiClient, fromQueryBase));
    }
    return toObject;
}
function listModelsParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], listModelsConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function updateModelConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (parentObject !== undefined && fromDisplayName != null) {
        setValueByPath(parentObject, ['displayName'], fromDisplayName);
    }
    const fromDescription = getValueByPath(fromObject, ['description']);
    if (parentObject !== undefined && fromDescription != null) {
        setValueByPath(parentObject, ['description'], fromDescription);
    }
    return toObject;
}
function updateModelParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], updateModelConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function deleteModelParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'name'], tModel(apiClient, fromModel));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function countTokensConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromSystemInstruction = getValueByPath(fromObject, [
        'systemInstruction',
    ]);
    if (parentObject !== undefined && fromSystemInstruction != null) {
        setValueByPath(parentObject, ['systemInstruction'], contentToVertex(apiClient, tContent(apiClient, fromSystemInstruction)));
    }
    const fromTools = getValueByPath(fromObject, ['tools']);
    if (parentObject !== undefined && fromTools != null) {
        let transformedList = fromTools;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return toolToVertex(apiClient, item);
            });
        }
        setValueByPath(parentObject, ['tools'], transformedList);
    }
    const fromGenerationConfig = getValueByPath(fromObject, [
        'generationConfig',
    ]);
    if (parentObject !== undefined && fromGenerationConfig != null) {
        setValueByPath(parentObject, ['generationConfig'], fromGenerationConfig);
    }
    return toObject;
}
function countTokensParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (fromContents != null) {
        let transformedList = tContents(apiClient, fromContents);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentToVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['contents'], transformedList);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], countTokensConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function computeTokensParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromContents = getValueByPath(fromObject, ['contents']);
    if (fromContents != null) {
        let transformedList = tContents(apiClient, fromContents);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentToVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['contents'], transformedList);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function imageToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromGcsUri = getValueByPath(fromObject, ['gcsUri']);
    if (fromGcsUri != null) {
        setValueByPath(toObject, ['gcsUri'], fromGcsUri);
    }
    const fromImageBytes = getValueByPath(fromObject, ['imageBytes']);
    if (fromImageBytes != null) {
        setValueByPath(toObject, ['bytesBase64Encoded'], tBytes(apiClient, fromImageBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function generateVideosConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromNumberOfVideos = getValueByPath(fromObject, [
        'numberOfVideos',
    ]);
    if (parentObject !== undefined && fromNumberOfVideos != null) {
        setValueByPath(parentObject, ['parameters', 'sampleCount'], fromNumberOfVideos);
    }
    const fromOutputGcsUri = getValueByPath(fromObject, ['outputGcsUri']);
    if (parentObject !== undefined && fromOutputGcsUri != null) {
        setValueByPath(parentObject, ['parameters', 'storageUri'], fromOutputGcsUri);
    }
    const fromFps = getValueByPath(fromObject, ['fps']);
    if (parentObject !== undefined && fromFps != null) {
        setValueByPath(parentObject, ['parameters', 'fps'], fromFps);
    }
    const fromDurationSeconds = getValueByPath(fromObject, [
        'durationSeconds',
    ]);
    if (parentObject !== undefined && fromDurationSeconds != null) {
        setValueByPath(parentObject, ['parameters', 'durationSeconds'], fromDurationSeconds);
    }
    const fromSeed = getValueByPath(fromObject, ['seed']);
    if (parentObject !== undefined && fromSeed != null) {
        setValueByPath(parentObject, ['parameters', 'seed'], fromSeed);
    }
    const fromAspectRatio = getValueByPath(fromObject, ['aspectRatio']);
    if (parentObject !== undefined && fromAspectRatio != null) {
        setValueByPath(parentObject, ['parameters', 'aspectRatio'], fromAspectRatio);
    }
    const fromResolution = getValueByPath(fromObject, ['resolution']);
    if (parentObject !== undefined && fromResolution != null) {
        setValueByPath(parentObject, ['parameters', 'resolution'], fromResolution);
    }
    const fromPersonGeneration = getValueByPath(fromObject, [
        'personGeneration',
    ]);
    if (parentObject !== undefined && fromPersonGeneration != null) {
        setValueByPath(parentObject, ['parameters', 'personGeneration'], fromPersonGeneration);
    }
    const fromPubsubTopic = getValueByPath(fromObject, ['pubsubTopic']);
    if (parentObject !== undefined && fromPubsubTopic != null) {
        setValueByPath(parentObject, ['parameters', 'pubsubTopic'], fromPubsubTopic);
    }
    const fromNegativePrompt = getValueByPath(fromObject, [
        'negativePrompt',
    ]);
    if (parentObject !== undefined && fromNegativePrompt != null) {
        setValueByPath(parentObject, ['parameters', 'negativePrompt'], fromNegativePrompt);
    }
    const fromEnhancePrompt = getValueByPath(fromObject, [
        'enhancePrompt',
    ]);
    if (parentObject !== undefined && fromEnhancePrompt != null) {
        setValueByPath(parentObject, ['parameters', 'enhancePrompt'], fromEnhancePrompt);
    }
    return toObject;
}
function generateVideosParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['_url', 'model'], tModel(apiClient, fromModel));
    }
    const fromPrompt = getValueByPath(fromObject, ['prompt']);
    if (fromPrompt != null) {
        setValueByPath(toObject, ['instances[0]', 'prompt'], fromPrompt);
    }
    const fromImage = getValueByPath(fromObject, ['image']);
    if (fromImage != null) {
        setValueByPath(toObject, ['instances[0]', 'image'], imageToVertex(apiClient, fromImage));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], generateVideosConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function partFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function citationMetadataFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromCitations = getValueByPath(fromObject, ['citationSources']);
    if (fromCitations != null) {
        setValueByPath(toObject, ['citations'], fromCitations);
    }
    return toObject;
}
function candidateFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromContent = getValueByPath(fromObject, ['content']);
    if (fromContent != null) {
        setValueByPath(toObject, ['content'], contentFromMldev(apiClient, fromContent));
    }
    const fromCitationMetadata = getValueByPath(fromObject, [
        'citationMetadata',
    ]);
    if (fromCitationMetadata != null) {
        setValueByPath(toObject, ['citationMetadata'], citationMetadataFromMldev(apiClient, fromCitationMetadata));
    }
    const fromTokenCount = getValueByPath(fromObject, ['tokenCount']);
    if (fromTokenCount != null) {
        setValueByPath(toObject, ['tokenCount'], fromTokenCount);
    }
    const fromFinishReason = getValueByPath(fromObject, ['finishReason']);
    if (fromFinishReason != null) {
        setValueByPath(toObject, ['finishReason'], fromFinishReason);
    }
    const fromAvgLogprobs = getValueByPath(fromObject, ['avgLogprobs']);
    if (fromAvgLogprobs != null) {
        setValueByPath(toObject, ['avgLogprobs'], fromAvgLogprobs);
    }
    const fromGroundingMetadata = getValueByPath(fromObject, [
        'groundingMetadata',
    ]);
    if (fromGroundingMetadata != null) {
        setValueByPath(toObject, ['groundingMetadata'], fromGroundingMetadata);
    }
    const fromIndex = getValueByPath(fromObject, ['index']);
    if (fromIndex != null) {
        setValueByPath(toObject, ['index'], fromIndex);
    }
    const fromLogprobsResult = getValueByPath(fromObject, [
        'logprobsResult',
    ]);
    if (fromLogprobsResult != null) {
        setValueByPath(toObject, ['logprobsResult'], fromLogprobsResult);
    }
    const fromSafetyRatings = getValueByPath(fromObject, [
        'safetyRatings',
    ]);
    if (fromSafetyRatings != null) {
        setValueByPath(toObject, ['safetyRatings'], fromSafetyRatings);
    }
    return toObject;
}
function generateContentResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromCandidates = getValueByPath(fromObject, ['candidates']);
    if (fromCandidates != null) {
        let transformedList = fromCandidates;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return candidateFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['candidates'], transformedList);
    }
    const fromModelVersion = getValueByPath(fromObject, ['modelVersion']);
    if (fromModelVersion != null) {
        setValueByPath(toObject, ['modelVersion'], fromModelVersion);
    }
    const fromPromptFeedback = getValueByPath(fromObject, [
        'promptFeedback',
    ]);
    if (fromPromptFeedback != null) {
        setValueByPath(toObject, ['promptFeedback'], fromPromptFeedback);
    }
    const fromUsageMetadata = getValueByPath(fromObject, [
        'usageMetadata',
    ]);
    if (fromUsageMetadata != null) {
        setValueByPath(toObject, ['usageMetadata'], fromUsageMetadata);
    }
    return toObject;
}
function contentEmbeddingFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromValues = getValueByPath(fromObject, ['values']);
    if (fromValues != null) {
        setValueByPath(toObject, ['values'], fromValues);
    }
    return toObject;
}
function embedContentMetadataFromMldev() {
    const toObject = {};
    return toObject;
}
function embedContentResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromEmbeddings = getValueByPath(fromObject, ['embeddings']);
    if (fromEmbeddings != null) {
        let transformedList = fromEmbeddings;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentEmbeddingFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['embeddings'], transformedList);
    }
    const fromMetadata = getValueByPath(fromObject, ['metadata']);
    if (fromMetadata != null) {
        setValueByPath(toObject, ['metadata'], embedContentMetadataFromMldev());
    }
    return toObject;
}
function imageFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromImageBytes = getValueByPath(fromObject, [
        'bytesBase64Encoded',
    ]);
    if (fromImageBytes != null) {
        setValueByPath(toObject, ['imageBytes'], tBytes(apiClient, fromImageBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function safetyAttributesFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromCategories = getValueByPath(fromObject, [
        'safetyAttributes',
        'categories',
    ]);
    if (fromCategories != null) {
        setValueByPath(toObject, ['categories'], fromCategories);
    }
    const fromScores = getValueByPath(fromObject, [
        'safetyAttributes',
        'scores',
    ]);
    if (fromScores != null) {
        setValueByPath(toObject, ['scores'], fromScores);
    }
    const fromContentType = getValueByPath(fromObject, ['contentType']);
    if (fromContentType != null) {
        setValueByPath(toObject, ['contentType'], fromContentType);
    }
    return toObject;
}
function generatedImageFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromImage = getValueByPath(fromObject, ['_self']);
    if (fromImage != null) {
        setValueByPath(toObject, ['image'], imageFromMldev(apiClient, fromImage));
    }
    const fromRaiFilteredReason = getValueByPath(fromObject, [
        'raiFilteredReason',
    ]);
    if (fromRaiFilteredReason != null) {
        setValueByPath(toObject, ['raiFilteredReason'], fromRaiFilteredReason);
    }
    const fromSafetyAttributes = getValueByPath(fromObject, ['_self']);
    if (fromSafetyAttributes != null) {
        setValueByPath(toObject, ['safetyAttributes'], safetyAttributesFromMldev(apiClient, fromSafetyAttributes));
    }
    return toObject;
}
function generateImagesResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromGeneratedImages = getValueByPath(fromObject, [
        'predictions',
    ]);
    if (fromGeneratedImages != null) {
        let transformedList = fromGeneratedImages;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return generatedImageFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['generatedImages'], transformedList);
    }
    const fromPositivePromptSafetyAttributes = getValueByPath(fromObject, [
        'positivePromptSafetyAttributes',
    ]);
    if (fromPositivePromptSafetyAttributes != null) {
        setValueByPath(toObject, ['positivePromptSafetyAttributes'], safetyAttributesFromMldev(apiClient, fromPositivePromptSafetyAttributes));
    }
    return toObject;
}
function tunedModelInfoFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromBaseModel = getValueByPath(fromObject, ['baseModel']);
    if (fromBaseModel != null) {
        setValueByPath(toObject, ['baseModel'], fromBaseModel);
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    return toObject;
}
function modelFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (fromDisplayName != null) {
        setValueByPath(toObject, ['displayName'], fromDisplayName);
    }
    const fromDescription = getValueByPath(fromObject, ['description']);
    if (fromDescription != null) {
        setValueByPath(toObject, ['description'], fromDescription);
    }
    const fromVersion = getValueByPath(fromObject, ['version']);
    if (fromVersion != null) {
        setValueByPath(toObject, ['version'], fromVersion);
    }
    const fromTunedModelInfo = getValueByPath(fromObject, ['_self']);
    if (fromTunedModelInfo != null) {
        setValueByPath(toObject, ['tunedModelInfo'], tunedModelInfoFromMldev(apiClient, fromTunedModelInfo));
    }
    const fromInputTokenLimit = getValueByPath(fromObject, [
        'inputTokenLimit',
    ]);
    if (fromInputTokenLimit != null) {
        setValueByPath(toObject, ['inputTokenLimit'], fromInputTokenLimit);
    }
    const fromOutputTokenLimit = getValueByPath(fromObject, [
        'outputTokenLimit',
    ]);
    if (fromOutputTokenLimit != null) {
        setValueByPath(toObject, ['outputTokenLimit'], fromOutputTokenLimit);
    }
    const fromSupportedActions = getValueByPath(fromObject, [
        'supportedGenerationMethods',
    ]);
    if (fromSupportedActions != null) {
        setValueByPath(toObject, ['supportedActions'], fromSupportedActions);
    }
    return toObject;
}
function listModelsResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromNextPageToken = getValueByPath(fromObject, [
        'nextPageToken',
    ]);
    if (fromNextPageToken != null) {
        setValueByPath(toObject, ['nextPageToken'], fromNextPageToken);
    }
    const fromModels = getValueByPath(fromObject, ['_self']);
    if (fromModels != null) {
        let transformedList = tExtractModels(apiClient, fromModels);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modelFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['models'], transformedList);
    }
    return toObject;
}
function deleteModelResponseFromMldev() {
    const toObject = {};
    return toObject;
}
function countTokensResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromTotalTokens = getValueByPath(fromObject, ['totalTokens']);
    if (fromTotalTokens != null) {
        setValueByPath(toObject, ['totalTokens'], fromTotalTokens);
    }
    const fromCachedContentTokenCount = getValueByPath(fromObject, [
        'cachedContentTokenCount',
    ]);
    if (fromCachedContentTokenCount != null) {
        setValueByPath(toObject, ['cachedContentTokenCount'], fromCachedContentTokenCount);
    }
    return toObject;
}
function videoFromMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromUri = getValueByPath(fromObject, ['video', 'uri']);
    if (fromUri != null) {
        setValueByPath(toObject, ['uri'], fromUri);
    }
    const fromVideoBytes = getValueByPath(fromObject, [
        'video',
        'encodedVideo',
    ]);
    if (fromVideoBytes != null) {
        setValueByPath(toObject, ['videoBytes'], tBytes(apiClient, fromVideoBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['encoding']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function generatedVideoFromMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromVideo = getValueByPath(fromObject, ['_self']);
    if (fromVideo != null) {
        setValueByPath(toObject, ['video'], videoFromMldev$1(apiClient, fromVideo));
    }
    return toObject;
}
function generateVideosResponseFromMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromGeneratedVideos = getValueByPath(fromObject, [
        'generatedSamples',
    ]);
    if (fromGeneratedVideos != null) {
        let transformedList = fromGeneratedVideos;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return generatedVideoFromMldev$1(apiClient, item);
            });
        }
        setValueByPath(toObject, ['generatedVideos'], transformedList);
    }
    const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
        'raiMediaFilteredCount',
    ]);
    if (fromRaiMediaFilteredCount != null) {
        setValueByPath(toObject, ['raiMediaFilteredCount'], fromRaiMediaFilteredCount);
    }
    const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
        'raiMediaFilteredReasons',
    ]);
    if (fromRaiMediaFilteredReasons != null) {
        setValueByPath(toObject, ['raiMediaFilteredReasons'], fromRaiMediaFilteredReasons);
    }
    return toObject;
}
function generateVideosOperationFromMldev$1(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromMetadata = getValueByPath(fromObject, ['metadata']);
    if (fromMetadata != null) {
        setValueByPath(toObject, ['metadata'], fromMetadata);
    }
    const fromDone = getValueByPath(fromObject, ['done']);
    if (fromDone != null) {
        setValueByPath(toObject, ['done'], fromDone);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fromError);
    }
    const fromResponse = getValueByPath(fromObject, [
        'response',
        'generateVideoResponse',
    ]);
    if (fromResponse != null) {
        setValueByPath(toObject, ['response'], generateVideosResponseFromMldev$1(apiClient, fromResponse));
    }
    return toObject;
}
function partFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromVideoMetadata = getValueByPath(fromObject, [
        'videoMetadata',
    ]);
    if (fromVideoMetadata != null) {
        setValueByPath(toObject, ['videoMetadata'], fromVideoMetadata);
    }
    const fromThought = getValueByPath(fromObject, ['thought']);
    if (fromThought != null) {
        setValueByPath(toObject, ['thought'], fromThought);
    }
    const fromCodeExecutionResult = getValueByPath(fromObject, [
        'codeExecutionResult',
    ]);
    if (fromCodeExecutionResult != null) {
        setValueByPath(toObject, ['codeExecutionResult'], fromCodeExecutionResult);
    }
    const fromExecutableCode = getValueByPath(fromObject, [
        'executableCode',
    ]);
    if (fromExecutableCode != null) {
        setValueByPath(toObject, ['executableCode'], fromExecutableCode);
    }
    const fromFileData = getValueByPath(fromObject, ['fileData']);
    if (fromFileData != null) {
        setValueByPath(toObject, ['fileData'], fromFileData);
    }
    const fromFunctionCall = getValueByPath(fromObject, ['functionCall']);
    if (fromFunctionCall != null) {
        setValueByPath(toObject, ['functionCall'], fromFunctionCall);
    }
    const fromFunctionResponse = getValueByPath(fromObject, [
        'functionResponse',
    ]);
    if (fromFunctionResponse != null) {
        setValueByPath(toObject, ['functionResponse'], fromFunctionResponse);
    }
    const fromInlineData = getValueByPath(fromObject, ['inlineData']);
    if (fromInlineData != null) {
        setValueByPath(toObject, ['inlineData'], fromInlineData);
    }
    const fromText = getValueByPath(fromObject, ['text']);
    if (fromText != null) {
        setValueByPath(toObject, ['text'], fromText);
    }
    return toObject;
}
function contentFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromParts = getValueByPath(fromObject, ['parts']);
    if (fromParts != null) {
        let transformedList = fromParts;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return partFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['parts'], transformedList);
    }
    const fromRole = getValueByPath(fromObject, ['role']);
    if (fromRole != null) {
        setValueByPath(toObject, ['role'], fromRole);
    }
    return toObject;
}
function citationMetadataFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromCitations = getValueByPath(fromObject, ['citations']);
    if (fromCitations != null) {
        setValueByPath(toObject, ['citations'], fromCitations);
    }
    return toObject;
}
function candidateFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromContent = getValueByPath(fromObject, ['content']);
    if (fromContent != null) {
        setValueByPath(toObject, ['content'], contentFromVertex(apiClient, fromContent));
    }
    const fromCitationMetadata = getValueByPath(fromObject, [
        'citationMetadata',
    ]);
    if (fromCitationMetadata != null) {
        setValueByPath(toObject, ['citationMetadata'], citationMetadataFromVertex(apiClient, fromCitationMetadata));
    }
    const fromFinishMessage = getValueByPath(fromObject, [
        'finishMessage',
    ]);
    if (fromFinishMessage != null) {
        setValueByPath(toObject, ['finishMessage'], fromFinishMessage);
    }
    const fromFinishReason = getValueByPath(fromObject, ['finishReason']);
    if (fromFinishReason != null) {
        setValueByPath(toObject, ['finishReason'], fromFinishReason);
    }
    const fromAvgLogprobs = getValueByPath(fromObject, ['avgLogprobs']);
    if (fromAvgLogprobs != null) {
        setValueByPath(toObject, ['avgLogprobs'], fromAvgLogprobs);
    }
    const fromGroundingMetadata = getValueByPath(fromObject, [
        'groundingMetadata',
    ]);
    if (fromGroundingMetadata != null) {
        setValueByPath(toObject, ['groundingMetadata'], fromGroundingMetadata);
    }
    const fromIndex = getValueByPath(fromObject, ['index']);
    if (fromIndex != null) {
        setValueByPath(toObject, ['index'], fromIndex);
    }
    const fromLogprobsResult = getValueByPath(fromObject, [
        'logprobsResult',
    ]);
    if (fromLogprobsResult != null) {
        setValueByPath(toObject, ['logprobsResult'], fromLogprobsResult);
    }
    const fromSafetyRatings = getValueByPath(fromObject, [
        'safetyRatings',
    ]);
    if (fromSafetyRatings != null) {
        setValueByPath(toObject, ['safetyRatings'], fromSafetyRatings);
    }
    return toObject;
}
function generateContentResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromCandidates = getValueByPath(fromObject, ['candidates']);
    if (fromCandidates != null) {
        let transformedList = fromCandidates;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return candidateFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['candidates'], transformedList);
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromResponseId = getValueByPath(fromObject, ['responseId']);
    if (fromResponseId != null) {
        setValueByPath(toObject, ['responseId'], fromResponseId);
    }
    const fromModelVersion = getValueByPath(fromObject, ['modelVersion']);
    if (fromModelVersion != null) {
        setValueByPath(toObject, ['modelVersion'], fromModelVersion);
    }
    const fromPromptFeedback = getValueByPath(fromObject, [
        'promptFeedback',
    ]);
    if (fromPromptFeedback != null) {
        setValueByPath(toObject, ['promptFeedback'], fromPromptFeedback);
    }
    const fromUsageMetadata = getValueByPath(fromObject, [
        'usageMetadata',
    ]);
    if (fromUsageMetadata != null) {
        setValueByPath(toObject, ['usageMetadata'], fromUsageMetadata);
    }
    return toObject;
}
function contentEmbeddingStatisticsFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromTruncated = getValueByPath(fromObject, ['truncated']);
    if (fromTruncated != null) {
        setValueByPath(toObject, ['truncated'], fromTruncated);
    }
    const fromTokenCount = getValueByPath(fromObject, ['token_count']);
    if (fromTokenCount != null) {
        setValueByPath(toObject, ['tokenCount'], fromTokenCount);
    }
    return toObject;
}
function contentEmbeddingFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromValues = getValueByPath(fromObject, ['values']);
    if (fromValues != null) {
        setValueByPath(toObject, ['values'], fromValues);
    }
    const fromStatistics = getValueByPath(fromObject, ['statistics']);
    if (fromStatistics != null) {
        setValueByPath(toObject, ['statistics'], contentEmbeddingStatisticsFromVertex(apiClient, fromStatistics));
    }
    return toObject;
}
function embedContentMetadataFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromBillableCharacterCount = getValueByPath(fromObject, [
        'billableCharacterCount',
    ]);
    if (fromBillableCharacterCount != null) {
        setValueByPath(toObject, ['billableCharacterCount'], fromBillableCharacterCount);
    }
    return toObject;
}
function embedContentResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromEmbeddings = getValueByPath(fromObject, [
        'predictions[]',
        'embeddings',
    ]);
    if (fromEmbeddings != null) {
        let transformedList = fromEmbeddings;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return contentEmbeddingFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['embeddings'], transformedList);
    }
    const fromMetadata = getValueByPath(fromObject, ['metadata']);
    if (fromMetadata != null) {
        setValueByPath(toObject, ['metadata'], embedContentMetadataFromVertex(apiClient, fromMetadata));
    }
    return toObject;
}
function imageFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromGcsUri = getValueByPath(fromObject, ['gcsUri']);
    if (fromGcsUri != null) {
        setValueByPath(toObject, ['gcsUri'], fromGcsUri);
    }
    const fromImageBytes = getValueByPath(fromObject, [
        'bytesBase64Encoded',
    ]);
    if (fromImageBytes != null) {
        setValueByPath(toObject, ['imageBytes'], tBytes(apiClient, fromImageBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function safetyAttributesFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromCategories = getValueByPath(fromObject, [
        'safetyAttributes',
        'categories',
    ]);
    if (fromCategories != null) {
        setValueByPath(toObject, ['categories'], fromCategories);
    }
    const fromScores = getValueByPath(fromObject, [
        'safetyAttributes',
        'scores',
    ]);
    if (fromScores != null) {
        setValueByPath(toObject, ['scores'], fromScores);
    }
    const fromContentType = getValueByPath(fromObject, ['contentType']);
    if (fromContentType != null) {
        setValueByPath(toObject, ['contentType'], fromContentType);
    }
    return toObject;
}
function generatedImageFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromImage = getValueByPath(fromObject, ['_self']);
    if (fromImage != null) {
        setValueByPath(toObject, ['image'], imageFromVertex(apiClient, fromImage));
    }
    const fromRaiFilteredReason = getValueByPath(fromObject, [
        'raiFilteredReason',
    ]);
    if (fromRaiFilteredReason != null) {
        setValueByPath(toObject, ['raiFilteredReason'], fromRaiFilteredReason);
    }
    const fromSafetyAttributes = getValueByPath(fromObject, ['_self']);
    if (fromSafetyAttributes != null) {
        setValueByPath(toObject, ['safetyAttributes'], safetyAttributesFromVertex(apiClient, fromSafetyAttributes));
    }
    const fromEnhancedPrompt = getValueByPath(fromObject, ['prompt']);
    if (fromEnhancedPrompt != null) {
        setValueByPath(toObject, ['enhancedPrompt'], fromEnhancedPrompt);
    }
    return toObject;
}
function generateImagesResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromGeneratedImages = getValueByPath(fromObject, [
        'predictions',
    ]);
    if (fromGeneratedImages != null) {
        let transformedList = fromGeneratedImages;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return generatedImageFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['generatedImages'], transformedList);
    }
    const fromPositivePromptSafetyAttributes = getValueByPath(fromObject, [
        'positivePromptSafetyAttributes',
    ]);
    if (fromPositivePromptSafetyAttributes != null) {
        setValueByPath(toObject, ['positivePromptSafetyAttributes'], safetyAttributesFromVertex(apiClient, fromPositivePromptSafetyAttributes));
    }
    return toObject;
}
function endpointFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['endpoint']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromDeployedModelId = getValueByPath(fromObject, [
        'deployedModelId',
    ]);
    if (fromDeployedModelId != null) {
        setValueByPath(toObject, ['deployedModelId'], fromDeployedModelId);
    }
    return toObject;
}
function tunedModelInfoFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromBaseModel = getValueByPath(fromObject, [
        'labels',
        'google-vertex-llm-tuning-base-model-id',
    ]);
    if (fromBaseModel != null) {
        setValueByPath(toObject, ['baseModel'], fromBaseModel);
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    return toObject;
}
function modelFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromDisplayName = getValueByPath(fromObject, ['displayName']);
    if (fromDisplayName != null) {
        setValueByPath(toObject, ['displayName'], fromDisplayName);
    }
    const fromDescription = getValueByPath(fromObject, ['description']);
    if (fromDescription != null) {
        setValueByPath(toObject, ['description'], fromDescription);
    }
    const fromVersion = getValueByPath(fromObject, ['versionId']);
    if (fromVersion != null) {
        setValueByPath(toObject, ['version'], fromVersion);
    }
    const fromEndpoints = getValueByPath(fromObject, ['deployedModels']);
    if (fromEndpoints != null) {
        let transformedList = fromEndpoints;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return endpointFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['endpoints'], transformedList);
    }
    const fromLabels = getValueByPath(fromObject, ['labels']);
    if (fromLabels != null) {
        setValueByPath(toObject, ['labels'], fromLabels);
    }
    const fromTunedModelInfo = getValueByPath(fromObject, ['_self']);
    if (fromTunedModelInfo != null) {
        setValueByPath(toObject, ['tunedModelInfo'], tunedModelInfoFromVertex(apiClient, fromTunedModelInfo));
    }
    return toObject;
}
function listModelsResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromNextPageToken = getValueByPath(fromObject, [
        'nextPageToken',
    ]);
    if (fromNextPageToken != null) {
        setValueByPath(toObject, ['nextPageToken'], fromNextPageToken);
    }
    const fromModels = getValueByPath(fromObject, ['_self']);
    if (fromModels != null) {
        let transformedList = tExtractModels(apiClient, fromModels);
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return modelFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['models'], transformedList);
    }
    return toObject;
}
function deleteModelResponseFromVertex() {
    const toObject = {};
    return toObject;
}
function countTokensResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromTotalTokens = getValueByPath(fromObject, ['totalTokens']);
    if (fromTotalTokens != null) {
        setValueByPath(toObject, ['totalTokens'], fromTotalTokens);
    }
    return toObject;
}
function computeTokensResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromTokensInfo = getValueByPath(fromObject, ['tokensInfo']);
    if (fromTokensInfo != null) {
        setValueByPath(toObject, ['tokensInfo'], fromTokensInfo);
    }
    return toObject;
}
function videoFromVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromUri = getValueByPath(fromObject, ['gcsUri']);
    if (fromUri != null) {
        setValueByPath(toObject, ['uri'], fromUri);
    }
    const fromVideoBytes = getValueByPath(fromObject, [
        'bytesBase64Encoded',
    ]);
    if (fromVideoBytes != null) {
        setValueByPath(toObject, ['videoBytes'], tBytes(apiClient, fromVideoBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function generatedVideoFromVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromVideo = getValueByPath(fromObject, ['_self']);
    if (fromVideo != null) {
        setValueByPath(toObject, ['video'], videoFromVertex$1(apiClient, fromVideo));
    }
    return toObject;
}
function generateVideosResponseFromVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromGeneratedVideos = getValueByPath(fromObject, ['videos']);
    if (fromGeneratedVideos != null) {
        let transformedList = fromGeneratedVideos;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return generatedVideoFromVertex$1(apiClient, item);
            });
        }
        setValueByPath(toObject, ['generatedVideos'], transformedList);
    }
    const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
        'raiMediaFilteredCount',
    ]);
    if (fromRaiMediaFilteredCount != null) {
        setValueByPath(toObject, ['raiMediaFilteredCount'], fromRaiMediaFilteredCount);
    }
    const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
        'raiMediaFilteredReasons',
    ]);
    if (fromRaiMediaFilteredReasons != null) {
        setValueByPath(toObject, ['raiMediaFilteredReasons'], fromRaiMediaFilteredReasons);
    }
    return toObject;
}
function generateVideosOperationFromVertex$1(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromMetadata = getValueByPath(fromObject, ['metadata']);
    if (fromMetadata != null) {
        setValueByPath(toObject, ['metadata'], fromMetadata);
    }
    const fromDone = getValueByPath(fromObject, ['done']);
    if (fromDone != null) {
        setValueByPath(toObject, ['done'], fromDone);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fromError);
    }
    const fromResponse = getValueByPath(fromObject, ['response']);
    if (fromResponse != null) {
        setValueByPath(toObject, ['response'], generateVideosResponseFromVertex$1(apiClient, fromResponse));
    }
    return toObject;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const FUNCTION_RESPONSE_REQUIRES_ID = 'FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.';
/**
 * Handles incoming messages from the WebSocket.
 *
 * @remarks
 * This function is responsible for parsing incoming messages, transforming them
 * into LiveServerMessages, and then calling the onmessage callback. Note that
 * the first message which is received from the server is a setupComplete
 * message.
 *
 * @param apiClient The ApiClient instance.
 * @param onmessage The user-provided onmessage callback (if any).
 * @param event The MessageEvent from the WebSocket.
 */
async function handleWebSocketMessage(apiClient, onmessage, event) {
    const serverMessage = new LiveServerMessage();
    let data;
    if (event.data instanceof Blob) {
        data = JSON.parse(await event.data.text());
    }
    else {
        data = JSON.parse(event.data);
    }
    if (apiClient.isVertexAI()) {
        const resp = liveServerMessageFromVertex(apiClient, data);
        Object.assign(serverMessage, resp);
    }
    else {
        const resp = liveServerMessageFromMldev(apiClient, data);
        Object.assign(serverMessage, resp);
    }
    onmessage(serverMessage);
}
/**
   Live class encapsulates the configuration for live interaction with the
   Generative Language API. It embeds ApiClient for general API settings.

   @experimental
  */
class Live {
    constructor(apiClient, auth, webSocketFactory) {
        this.apiClient = apiClient;
        this.auth = auth;
        this.webSocketFactory = webSocketFactory;
    }
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
    async connect(params) {
        var _a, _b, _c, _d;
        const websocketBaseUrl = this.apiClient.getWebsocketBaseUrl();
        const apiVersion = this.apiClient.getApiVersion();
        let url;
        const headers = mapToHeaders(this.apiClient.getDefaultHeaders());
        if (this.apiClient.isVertexAI()) {
            url = `${websocketBaseUrl}/ws/google.cloud.aiplatform.${apiVersion}.LlmBidiService/BidiGenerateContent`;
            await this.auth.addAuthHeaders(headers);
        }
        else {
            const apiKey = this.apiClient.getApiKey();
            url = `${websocketBaseUrl}/ws/google.ai.generativelanguage.${apiVersion}.GenerativeService.BidiGenerateContent?key=${apiKey}`;
        }
        let onopenResolve = () => { };
        const onopenPromise = new Promise((resolve) => {
            onopenResolve = resolve;
        });
        const callbacks = params.callbacks;
        const onopenAwaitedCallback = function () {
            var _a;
            (_a = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onopen) === null || _a === void 0 ? void 0 : _a.call(callbacks);
            onopenResolve({});
        };
        const apiClient = this.apiClient;
        const websocketCallbacks = {
            onopen: onopenAwaitedCallback,
            onmessage: (event) => {
                void handleWebSocketMessage(apiClient, callbacks.onmessage, event);
            },
            onerror: (_a = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onerror) !== null && _a !== void 0 ? _a : function (e) {
            },
            onclose: (_b = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onclose) !== null && _b !== void 0 ? _b : function (e) {
            },
        };
        const conn = this.webSocketFactory.create(url, headersToMap(headers), websocketCallbacks);
        conn.connect();
        // Wait for the websocket to open before sending requests.
        await onopenPromise;
        let transformedModel = tModel(this.apiClient, params.model);
        if (this.apiClient.isVertexAI() &&
            transformedModel.startsWith('publishers/')) {
            const project = this.apiClient.getProject();
            const location = this.apiClient.getLocation();
            transformedModel =
                `projects/${project}/locations/${location}/` + transformedModel;
        }
        let clientMessage = {};
        if (this.apiClient.isVertexAI() &&
            ((_c = params.config) === null || _c === void 0 ? void 0 : _c.responseModalities) === undefined) {
            // Set default to AUDIO to align with MLDev API.
            if (params.config === undefined) {
                params.config = { responseModalities: [Modality.AUDIO] };
            }
            else {
                params.config.responseModalities = [Modality.AUDIO];
            }
        }
        if ((_d = params.config) === null || _d === void 0 ? void 0 : _d.generationConfig) {
            // Raise deprecation warning for generationConfig.
            console.warn('Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).');
        }
        const liveConnectParameters = {
            model: transformedModel,
            config: params.config,
            callbacks: params.callbacks,
        };
        if (this.apiClient.isVertexAI()) {
            clientMessage = liveConnectParametersToVertex(this.apiClient, liveConnectParameters);
        }
        else {
            clientMessage = liveConnectParametersToMldev(this.apiClient, liveConnectParameters);
        }
        delete clientMessage['config'];
        conn.send(JSON.stringify(clientMessage));
        return new Session(conn, this.apiClient);
    }
}
const defaultLiveSendClientContentParamerters = {
    turnComplete: true,
};
/**
   Represents a connection to the API.

   @experimental
  */
class Session {
    constructor(conn, apiClient) {
        this.conn = conn;
        this.apiClient = apiClient;
    }
    tLiveClientContent(apiClient, params) {
        if (params.turns !== null && params.turns !== undefined) {
            let contents = [];
            try {
                contents = tContents(apiClient, params.turns);
                if (apiClient.isVertexAI()) {
                    contents = contents.map((item) => contentToVertex(apiClient, item));
                }
                else {
                    contents = contents.map((item) => contentToMldev(apiClient, item));
                }
            }
            catch (_a) {
                throw new Error(`Failed to parse client content "turns", type: '${typeof params.turns}'`);
            }
            return {
                clientContent: { turns: contents, turnComplete: params.turnComplete },
            };
        }
        return {
            clientContent: { turnComplete: params.turnComplete },
        };
    }
    tLiveClienttToolResponse(apiClient, params) {
        let functionResponses = [];
        if (params.functionResponses == null) {
            throw new Error('functionResponses is required.');
        }
        if (!Array.isArray(params.functionResponses)) {
            functionResponses = [params.functionResponses];
        }
        else {
            functionResponses = params.functionResponses;
        }
        if (functionResponses.length === 0) {
            throw new Error('functionResponses is required.');
        }
        for (const functionResponse of functionResponses) {
            if (typeof functionResponse !== 'object' ||
                functionResponse === null ||
                !('name' in functionResponse) ||
                !('response' in functionResponse)) {
                throw new Error(`Could not parse function response, type '${typeof functionResponse}'.`);
            }
            if (!apiClient.isVertexAI() && !('id' in functionResponse)) {
                throw new Error(FUNCTION_RESPONSE_REQUIRES_ID);
            }
        }
        const clientMessage = {
            toolResponse: { functionResponses: functionResponses },
        };
        return clientMessage;
    }
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
    sendClientContent(params) {
        params = Object.assign(Object.assign({}, defaultLiveSendClientContentParamerters), params);
        const clientMessage = this.tLiveClientContent(this.apiClient, params);
        this.conn.send(JSON.stringify(clientMessage));
    }
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
    sendRealtimeInput(params) {
        let clientMessage = {};
        if (this.apiClient.isVertexAI()) {
            clientMessage = {
                'realtimeInput': liveSendRealtimeInputParametersToVertex(this.apiClient, params),
            };
        }
        else {
            clientMessage = {
                'realtimeInput': liveSendRealtimeInputParametersToMldev(this.apiClient, params),
            };
        }
        this.conn.send(JSON.stringify(clientMessage));
    }
    /**
      Send a function response message over the established connection.
  
      @param params - Contains property `functionResponses`.
  
        - `functionResponses` will be converted to a `functionResponses[]`
  
      @remarks
      Use `sendFunctionResponse` to reply to `LiveServerToolCall` from the server.
  
      Use {@link types.LiveConnectConfig#tools} to configure the callable functions.
  
      @experimental
     */
    sendToolResponse(params) {
        if (params.functionResponses == null) {
            throw new Error('Tool response parameters are required.');
        }
        const clientMessage = this.tLiveClienttToolResponse(this.apiClient, params);
        this.conn.send(JSON.stringify(clientMessage));
    }
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
    close() {
        this.conn.close();
    }
}
// Converts an headers object to a "map" object as expected by the WebSocket
// constructor. We use this as the Auth interface works with Headers objects
// while the WebSocket constructor takes a map.
function headersToMap(headers) {
    const headerMap = {};
    headers.forEach((value, key) => {
        headerMap[key] = value;
    });
    return headerMap;
}
// Converts a "map" object to a headers object. We use this as the Auth
// interface works with Headers objects while the API client default headers
// returns a map.
function mapToHeaders(map) {
    const headers = new Headers();
    for (const [key, value] of Object.entries(map)) {
        headers.append(key, value);
    }
    return headers;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Models extends BaseModule {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
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
        this.generateContent = async (params) => {
            return await this.generateContentInternal(params);
        };
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
        this.generateContentStream = async (params) => {
            return await this.generateContentStreamInternal(params);
        };
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
        this.generateImages = async (params) => {
            return await this.generateImagesInternal(params).then((apiResponse) => {
                var _a;
                let positivePromptSafetyAttributes;
                const generatedImages = [];
                if (apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.generatedImages) {
                    for (const generatedImage of apiResponse.generatedImages) {
                        if (generatedImage &&
                            (generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes) &&
                            ((_a = generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes) === null || _a === void 0 ? void 0 : _a.contentType) === 'Positive Prompt') {
                            positivePromptSafetyAttributes = generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes;
                        }
                        else {
                            generatedImages.push(generatedImage);
                        }
                    }
                }
                let response;
                if (positivePromptSafetyAttributes) {
                    response = {
                        generatedImages: generatedImages,
                        positivePromptSafetyAttributes: positivePromptSafetyAttributes,
                    };
                }
                else {
                    response = {
                        generatedImages: generatedImages,
                    };
                }
                return response;
            });
        };
        this.list = async (params) => {
            var _a;
            const defaultConfig = {
                queryBase: true,
            };
            const actualConfig = Object.assign(Object.assign({}, defaultConfig), params === null || params === void 0 ? void 0 : params.config);
            const actualParams = {
                config: actualConfig,
            };
            if (this.apiClient.isVertexAI()) {
                if (!actualParams.config.queryBase) {
                    if ((_a = actualParams.config) === null || _a === void 0 ? void 0 : _a.filter) {
                        throw new Error('Filtering tuned models list for Vertex AI is not currently supported');
                    }
                    else {
                        actualParams.config.filter = 'labels.tune-type:*';
                    }
                }
            }
            return new Pager(PagedItem.PAGED_ITEM_MODELS, (x) => this.listInternal(x), await this.listInternal(actualParams), actualParams);
        };
    }
    async generateContentInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = generateContentParametersToVertex(this.apiClient, params);
            path = formatMap('{model}:generateContent', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateContentResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new GenerateContentResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = generateContentParametersToMldev(this.apiClient, params);
            path = formatMap('{model}:generateContent', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateContentResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new GenerateContentResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
    async generateContentStreamInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = generateContentParametersToVertex(this.apiClient, params);
            path = formatMap('{model}:streamGenerateContent?alt=sse', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            const apiClient = this.apiClient;
            response = apiClient.requestStream({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            });
            return response.then(function (apiResponse) {
                return __asyncGenerator(this, arguments, function* () {
                    var _a, e_1, _b, _c;
                    try {
                        for (var _d = true, apiResponse_1 = __asyncValues(apiResponse), apiResponse_1_1; apiResponse_1_1 = yield __await(apiResponse_1.next()), _a = apiResponse_1_1.done, !_a; _d = true) {
                            _c = apiResponse_1_1.value;
                            _d = false;
                            const chunk = _c;
                            const resp = generateContentResponseFromVertex(apiClient, (yield __await(chunk.json())));
                            const typedResp = new GenerateContentResponse();
                            Object.assign(typedResp, resp);
                            yield yield __await(typedResp);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = apiResponse_1.return)) yield __await(_b.call(apiResponse_1));
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                });
            });
        }
        else {
            const body = generateContentParametersToMldev(this.apiClient, params);
            path = formatMap('{model}:streamGenerateContent?alt=sse', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            const apiClient = this.apiClient;
            response = apiClient.requestStream({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            });
            return response.then(function (apiResponse) {
                return __asyncGenerator(this, arguments, function* () {
                    var _a, e_2, _b, _c;
                    try {
                        for (var _d = true, apiResponse_2 = __asyncValues(apiResponse), apiResponse_2_1; apiResponse_2_1 = yield __await(apiResponse_2.next()), _a = apiResponse_2_1.done, !_a; _d = true) {
                            _c = apiResponse_2_1.value;
                            _d = false;
                            const chunk = _c;
                            const resp = generateContentResponseFromMldev(apiClient, (yield __await(chunk.json())));
                            const typedResp = new GenerateContentResponse();
                            Object.assign(typedResp, resp);
                            yield yield __await(typedResp);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = apiResponse_2.return)) yield __await(_b.call(apiResponse_2));
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                });
            });
        }
    }
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
    async embedContent(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = embedContentParametersToVertex(this.apiClient, params);
            path = formatMap('{model}:predict', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = embedContentResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new EmbedContentResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = embedContentParametersToMldev(this.apiClient, params);
            path = formatMap('{model}:batchEmbedContents', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = embedContentResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new EmbedContentResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
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
    async generateImagesInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = generateImagesParametersToVertex(this.apiClient, params);
            path = formatMap('{model}:predict', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateImagesResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new GenerateImagesResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = generateImagesParametersToMldev(this.apiClient, params);
            path = formatMap('{model}:predict', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateImagesResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new GenerateImagesResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
    /**
     * Fetches information about a model by name.
     *
     * @example
     * ```ts
     * const modelInfo = await ai.models.get({model: 'gemini-2.0-flash'});
     * ```
     */
    async get(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = getModelParametersToVertex(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = modelFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = getModelParametersToMldev(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = modelFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
    async listInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = listModelsParametersToVertex(this.apiClient, params);
            path = formatMap('{models_url}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = listModelsResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new ListModelsResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = listModelsParametersToMldev(this.apiClient, params);
            path = formatMap('{models_url}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = listModelsResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new ListModelsResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
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
    async update(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = updateModelParametersToVertex(this.apiClient, params);
            path = formatMap('{model}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'PATCH',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = modelFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = updateModelParametersToMldev(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'PATCH',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = modelFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
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
    async delete(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = deleteModelParametersToVertex(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'DELETE',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then(() => {
                const resp = deleteModelResponseFromVertex();
                const typedResp = new DeleteModelResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = deleteModelParametersToMldev(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'DELETE',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then(() => {
                const resp = deleteModelResponseFromMldev();
                const typedResp = new DeleteModelResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
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
    async countTokens(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = countTokensParametersToVertex(this.apiClient, params);
            path = formatMap('{model}:countTokens', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = countTokensResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new CountTokensResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = countTokensParametersToMldev(this.apiClient, params);
            path = formatMap('{model}:countTokens', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = countTokensResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new CountTokensResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
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
    async computeTokens(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = computeTokensParametersToVertex(this.apiClient, params);
            path = formatMap('{model}:computeTokens', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = computeTokensResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new ComputeTokensResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            throw new Error('This method is only supported by the Vertex AI.');
        }
    }
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
    async generateVideos(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = generateVideosParametersToVertex(this.apiClient, params);
            path = formatMap('{model}:predictLongRunning', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateVideosOperationFromVertex$1(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = generateVideosParametersToMldev(this.apiClient, params);
            path = formatMap('{model}:predictLongRunning', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateVideosOperationFromMldev$1(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function getOperationParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromOperationName = getValueByPath(fromObject, [
        'operationName',
    ]);
    if (fromOperationName != null) {
        setValueByPath(toObject, ['_url', 'operationName'], fromOperationName);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function getOperationParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromOperationName = getValueByPath(fromObject, [
        'operationName',
    ]);
    if (fromOperationName != null) {
        setValueByPath(toObject, ['_url', 'operationName'], fromOperationName);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function fetchPredictOperationParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromOperationName = getValueByPath(fromObject, [
        'operationName',
    ]);
    if (fromOperationName != null) {
        setValueByPath(toObject, ['operationName'], fromOperationName);
    }
    const fromResourceName = getValueByPath(fromObject, ['resourceName']);
    if (fromResourceName != null) {
        setValueByPath(toObject, ['_url', 'resourceName'], fromResourceName);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function videoFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromUri = getValueByPath(fromObject, ['video', 'uri']);
    if (fromUri != null) {
        setValueByPath(toObject, ['uri'], fromUri);
    }
    const fromVideoBytes = getValueByPath(fromObject, [
        'video',
        'encodedVideo',
    ]);
    if (fromVideoBytes != null) {
        setValueByPath(toObject, ['videoBytes'], tBytes(apiClient, fromVideoBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['encoding']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function generatedVideoFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromVideo = getValueByPath(fromObject, ['_self']);
    if (fromVideo != null) {
        setValueByPath(toObject, ['video'], videoFromMldev(apiClient, fromVideo));
    }
    return toObject;
}
function generateVideosResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromGeneratedVideos = getValueByPath(fromObject, [
        'generatedSamples',
    ]);
    if (fromGeneratedVideos != null) {
        let transformedList = fromGeneratedVideos;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return generatedVideoFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['generatedVideos'], transformedList);
    }
    const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
        'raiMediaFilteredCount',
    ]);
    if (fromRaiMediaFilteredCount != null) {
        setValueByPath(toObject, ['raiMediaFilteredCount'], fromRaiMediaFilteredCount);
    }
    const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
        'raiMediaFilteredReasons',
    ]);
    if (fromRaiMediaFilteredReasons != null) {
        setValueByPath(toObject, ['raiMediaFilteredReasons'], fromRaiMediaFilteredReasons);
    }
    return toObject;
}
function generateVideosOperationFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromMetadata = getValueByPath(fromObject, ['metadata']);
    if (fromMetadata != null) {
        setValueByPath(toObject, ['metadata'], fromMetadata);
    }
    const fromDone = getValueByPath(fromObject, ['done']);
    if (fromDone != null) {
        setValueByPath(toObject, ['done'], fromDone);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fromError);
    }
    const fromResponse = getValueByPath(fromObject, [
        'response',
        'generateVideoResponse',
    ]);
    if (fromResponse != null) {
        setValueByPath(toObject, ['response'], generateVideosResponseFromMldev(apiClient, fromResponse));
    }
    return toObject;
}
function videoFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromUri = getValueByPath(fromObject, ['gcsUri']);
    if (fromUri != null) {
        setValueByPath(toObject, ['uri'], fromUri);
    }
    const fromVideoBytes = getValueByPath(fromObject, [
        'bytesBase64Encoded',
    ]);
    if (fromVideoBytes != null) {
        setValueByPath(toObject, ['videoBytes'], tBytes(apiClient, fromVideoBytes));
    }
    const fromMimeType = getValueByPath(fromObject, ['mimeType']);
    if (fromMimeType != null) {
        setValueByPath(toObject, ['mimeType'], fromMimeType);
    }
    return toObject;
}
function generatedVideoFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromVideo = getValueByPath(fromObject, ['_self']);
    if (fromVideo != null) {
        setValueByPath(toObject, ['video'], videoFromVertex(apiClient, fromVideo));
    }
    return toObject;
}
function generateVideosResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromGeneratedVideos = getValueByPath(fromObject, ['videos']);
    if (fromGeneratedVideos != null) {
        let transformedList = fromGeneratedVideos;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return generatedVideoFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['generatedVideos'], transformedList);
    }
    const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
        'raiMediaFilteredCount',
    ]);
    if (fromRaiMediaFilteredCount != null) {
        setValueByPath(toObject, ['raiMediaFilteredCount'], fromRaiMediaFilteredCount);
    }
    const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
        'raiMediaFilteredReasons',
    ]);
    if (fromRaiMediaFilteredReasons != null) {
        setValueByPath(toObject, ['raiMediaFilteredReasons'], fromRaiMediaFilteredReasons);
    }
    return toObject;
}
function generateVideosOperationFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromMetadata = getValueByPath(fromObject, ['metadata']);
    if (fromMetadata != null) {
        setValueByPath(toObject, ['metadata'], fromMetadata);
    }
    const fromDone = getValueByPath(fromObject, ['done']);
    if (fromDone != null) {
        setValueByPath(toObject, ['done'], fromDone);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fromError);
    }
    const fromResponse = getValueByPath(fromObject, ['response']);
    if (fromResponse != null) {
        setValueByPath(toObject, ['response'], generateVideosResponseFromVertex(apiClient, fromResponse));
    }
    return toObject;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Operations extends BaseModule {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
    }
    /**
     * Gets the status of a long-running operation.
     *
     * @param parameters The parameters for the get operation request.
     * @return The updated Operation object, with the latest status or result.
     */
    async getVideosOperation(parameters) {
        const operation = parameters.operation;
        const config = parameters.config;
        if (operation.name === undefined || operation.name === '') {
            throw new Error('Operation name is required.');
        }
        if (this.apiClient.isVertexAI()) {
            const resourceName = operation.name.split('/operations/')[0];
            let httpOptions = undefined;
            if (config && 'httpOptions' in config) {
                httpOptions = config.httpOptions;
            }
            return this.fetchPredictVideosOperationInternal({
                operationName: operation.name,
                resourceName: resourceName,
                config: { httpOptions: httpOptions },
            });
        }
        else {
            return this.getVideosOperationInternal({
                operationName: operation.name,
                config: config,
            });
        }
    }
    async getVideosOperationInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = getOperationParametersToVertex(this.apiClient, params);
            path = formatMap('{operationName}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateVideosOperationFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = getOperationParametersToMldev(this.apiClient, params);
            path = formatMap('{operationName}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateVideosOperationFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
    async fetchPredictVideosOperationInternal(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = fetchPredictOperationParametersToVertex(this.apiClient, params);
            path = formatMap('{resourceName}:fetchPredictOperation', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = generateVideosOperationFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            throw new Error('This method is only supported by the Vertex AI.');
        }
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const CONTENT_TYPE_HEADER = 'Content-Type';
const SERVER_TIMEOUT_HEADER = 'X-Server-Timeout';
const USER_AGENT_HEADER = 'User-Agent';
const GOOGLE_API_CLIENT_HEADER = 'x-goog-api-client';
const SDK_VERSION = '0.13.0'; // x-release-please-version
const LIBRARY_LABEL = `google-genai-sdk/${SDK_VERSION}`;
const VERTEX_AI_API_DEFAULT_VERSION = 'v1beta1';
const GOOGLE_AI_API_DEFAULT_VERSION = 'v1beta';
const responseLineRE = /^data: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
/**
 * Client errors raised by the GenAI API.
 */
class ClientError extends Error {
    constructor(message, stackTrace) {
        if (stackTrace) {
            super(message, { cause: stackTrace });
        }
        else {
            super(message, { cause: new Error().stack });
        }
        this.message = message;
        this.name = 'ClientError';
    }
}
/**
 * Server errors raised by the GenAI API.
 */
class ServerError extends Error {
    constructor(message, stackTrace) {
        if (stackTrace) {
            super(message, { cause: stackTrace });
        }
        else {
            super(message, { cause: new Error().stack });
        }
        this.message = message;
        this.name = 'ServerError';
    }
}
/**
 * The ApiClient class is used to send requests to the Gemini API or Vertex AI
 * endpoints.
 */
class ApiClient {
    constructor(opts) {
        var _a, _b;
        this.clientOptions = Object.assign(Object.assign({}, opts), { project: opts.project, location: opts.location, apiKey: opts.apiKey, vertexai: opts.vertexai });
        const initHttpOptions = {};
        if (this.clientOptions.vertexai) {
            initHttpOptions.apiVersion =
                (_a = this.clientOptions.apiVersion) !== null && _a !== void 0 ? _a : VERTEX_AI_API_DEFAULT_VERSION;
            initHttpOptions.baseUrl = this.baseUrlFromProjectLocation();
            this.normalizeAuthParameters();
        }
        else {
            // Gemini API
            initHttpOptions.apiVersion =
                (_b = this.clientOptions.apiVersion) !== null && _b !== void 0 ? _b : GOOGLE_AI_API_DEFAULT_VERSION;
            initHttpOptions.baseUrl = `https://generativelanguage.googleapis.com/`;
        }
        initHttpOptions.headers = this.getDefaultHeaders();
        this.clientOptions.httpOptions = initHttpOptions;
        if (opts.httpOptions) {
            this.clientOptions.httpOptions = this.patchHttpOptions(initHttpOptions, opts.httpOptions);
        }
    }
    /**
     * Determines the base URL for Vertex AI based on project and location.
     * Uses the global endpoint if location is 'global' or if project/location
     * are not specified (implying API key usage).
     * @private
     */
    baseUrlFromProjectLocation() {
        if (this.clientOptions.project &&
            this.clientOptions.location &&
            this.clientOptions.location !== 'global') {
            // Regional endpoint
            return `https://${this.clientOptions.location}-aiplatform.googleapis.com/`;
        }
        // Global endpoint (covers 'global' location and API key usage)
        return `https://aiplatform.googleapis.com/`;
    }
    /**
     * Normalizes authentication parameters for Vertex AI.
     * If project and location are provided, API key is cleared.
     * If project and location are not provided (implying API key usage),
     * project and location are cleared.
     * @private
     */
    normalizeAuthParameters() {
        if (this.clientOptions.project && this.clientOptions.location) {
            // Using project/location for auth, clear potential API key
            this.clientOptions.apiKey = undefined;
            return;
        }
        // Using API key for auth (or no auth provided yet), clear project/location
        this.clientOptions.project = undefined;
        this.clientOptions.location = undefined;
    }
    isVertexAI() {
        var _a;
        return (_a = this.clientOptions.vertexai) !== null && _a !== void 0 ? _a : false;
    }
    getProject() {
        return this.clientOptions.project;
    }
    getLocation() {
        return this.clientOptions.location;
    }
    getApiVersion() {
        if (this.clientOptions.httpOptions &&
            this.clientOptions.httpOptions.apiVersion !== undefined) {
            return this.clientOptions.httpOptions.apiVersion;
        }
        throw new Error('API version is not set.');
    }
    getBaseUrl() {
        if (this.clientOptions.httpOptions &&
            this.clientOptions.httpOptions.baseUrl !== undefined) {
            return this.clientOptions.httpOptions.baseUrl;
        }
        throw new Error('Base URL is not set.');
    }
    getRequestUrl() {
        return this.getRequestUrlInternal(this.clientOptions.httpOptions);
    }
    getHeaders() {
        if (this.clientOptions.httpOptions &&
            this.clientOptions.httpOptions.headers !== undefined) {
            return this.clientOptions.httpOptions.headers;
        }
        else {
            throw new Error('Headers are not set.');
        }
    }
    getRequestUrlInternal(httpOptions) {
        if (!httpOptions ||
            httpOptions.baseUrl === undefined ||
            httpOptions.apiVersion === undefined) {
            throw new Error('HTTP options are not correctly set.');
        }
        const baseUrl = httpOptions.baseUrl.endsWith('/')
            ? httpOptions.baseUrl.slice(0, -1)
            : httpOptions.baseUrl;
        const urlElement = [baseUrl];
        if (httpOptions.apiVersion && httpOptions.apiVersion !== '') {
            urlElement.push(httpOptions.apiVersion);
        }
        return urlElement.join('/');
    }
    getBaseResourcePath() {
        return `projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`;
    }
    getApiKey() {
        return this.clientOptions.apiKey;
    }
    getWebsocketBaseUrl() {
        const baseUrl = this.getBaseUrl();
        const urlParts = new URL(baseUrl);
        urlParts.protocol = urlParts.protocol == 'http:' ? 'ws' : 'wss';
        return urlParts.toString();
    }
    setBaseUrl(url) {
        if (this.clientOptions.httpOptions) {
            this.clientOptions.httpOptions.baseUrl = url;
        }
        else {
            throw new Error('HTTP options are not correctly set.');
        }
    }
    constructUrl(path, httpOptions, prependProjectLocation) {
        const urlElement = [this.getRequestUrlInternal(httpOptions)];
        if (prependProjectLocation) {
            urlElement.push(this.getBaseResourcePath());
        }
        if (path !== '') {
            urlElement.push(path);
        }
        const url = new URL(`${urlElement.join('/')}`);
        return url;
    }
    shouldPrependVertexProjectPath(request) {
        if (this.clientOptions.apiKey) {
            return false;
        }
        if (!this.clientOptions.vertexai) {
            return false;
        }
        if (request.path.startsWith('projects/')) {
            // Assume the path already starts with
            // `projects/<project>/location/<location>`.
            return false;
        }
        if (request.httpMethod === 'GET' &&
            request.path.startsWith('publishers/google/models')) {
            // These paths are used by Vertex's models.get and models.list
            // calls. For base models Vertex does not accept a project/location
            // prefix (for tuned model the prefix is required).
            return false;
        }
        return true;
    }
    async request(request) {
        let patchedHttpOptions = this.clientOptions.httpOptions;
        if (request.httpOptions) {
            patchedHttpOptions = this.patchHttpOptions(this.clientOptions.httpOptions, request.httpOptions);
        }
        const prependProjectLocation = this.shouldPrependVertexProjectPath(request);
        const url = this.constructUrl(request.path, patchedHttpOptions, prependProjectLocation);
        if (request.queryParams) {
            for (const [key, value] of Object.entries(request.queryParams)) {
                url.searchParams.append(key, String(value));
            }
        }
        let requestInit = {};
        if (request.httpMethod === 'GET') {
            if (request.body && request.body !== '{}') {
                throw new Error('Request body should be empty for GET request, but got non empty request body');
            }
        }
        else {
            requestInit.body = request.body;
        }
        requestInit = await this.includeExtraHttpOptionsToRequestInit(requestInit, patchedHttpOptions, request.abortSignal);
        return this.unaryApiCall(url, requestInit, request.httpMethod);
    }
    patchHttpOptions(baseHttpOptions, requestHttpOptions) {
        const patchedHttpOptions = JSON.parse(JSON.stringify(baseHttpOptions));
        for (const [key, value] of Object.entries(requestHttpOptions)) {
            // Records compile to objects.
            if (typeof value === 'object') {
                // @ts-expect-error TS2345TS7053: Element implicitly has an 'any' type
                // because expression of type 'string' can't be used to index type
                // 'HttpOptions'.
                patchedHttpOptions[key] = Object.assign(Object.assign({}, patchedHttpOptions[key]), value);
            }
            else if (value !== undefined) {
                // @ts-expect-error TS2345TS7053: Element implicitly has an 'any' type
                // because expression of type 'string' can't be used to index type
                // 'HttpOptions'.
                patchedHttpOptions[key] = value;
            }
        }
        return patchedHttpOptions;
    }
    async requestStream(request) {
        let patchedHttpOptions = this.clientOptions.httpOptions;
        if (request.httpOptions) {
            patchedHttpOptions = this.patchHttpOptions(this.clientOptions.httpOptions, request.httpOptions);
        }
        const prependProjectLocation = this.shouldPrependVertexProjectPath(request);
        const url = this.constructUrl(request.path, patchedHttpOptions, prependProjectLocation);
        if (!url.searchParams.has('alt') || url.searchParams.get('alt') !== 'sse') {
            url.searchParams.set('alt', 'sse');
        }
        let requestInit = {};
        requestInit.body = request.body;
        requestInit = await this.includeExtraHttpOptionsToRequestInit(requestInit, patchedHttpOptions, request.abortSignal);
        return this.streamApiCall(url, requestInit, request.httpMethod);
    }
    async includeExtraHttpOptionsToRequestInit(requestInit, httpOptions, abortSignal) {
        if ((httpOptions && httpOptions.timeout) || abortSignal) {
            const abortController = new AbortController();
            const signal = abortController.signal;
            if (httpOptions.timeout && (httpOptions === null || httpOptions === void 0 ? void 0 : httpOptions.timeout) > 0) {
                setTimeout(() => abortController.abort(), httpOptions.timeout);
            }
            if (abortSignal) {
                abortSignal.addEventListener('abort', () => {
                    abortController.abort();
                });
            }
            requestInit.signal = signal;
        }
        requestInit.headers = await this.getHeadersInternal(httpOptions);
        return requestInit;
    }
    async unaryApiCall(url, requestInit, httpMethod) {
        return this.apiCall(url.toString(), Object.assign(Object.assign({}, requestInit), { method: httpMethod }))
            .then(async (response) => {
            await throwErrorIfNotOK(response);
            return new HttpResponse(response);
        })
            .catch((e) => {
            if (e instanceof Error) {
                throw e;
            }
            else {
                throw new Error(JSON.stringify(e));
            }
        });
    }
    async streamApiCall(url, requestInit, httpMethod) {
        return this.apiCall(url.toString(), Object.assign(Object.assign({}, requestInit), { method: httpMethod }))
            .then(async (response) => {
            await throwErrorIfNotOK(response);
            return this.processStreamResponse(response);
        })
            .catch((e) => {
            if (e instanceof Error) {
                throw e;
            }
            else {
                throw new Error(JSON.stringify(e));
            }
        });
    }
    processStreamResponse(response) {
        var _a;
        return __asyncGenerator(this, arguments, function* processStreamResponse_1() {
            const reader = (_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.getReader();
            const decoder = new TextDecoder('utf-8');
            if (!reader) {
                throw new Error('Response body is empty');
            }
            try {
                let buffer = '';
                while (true) {
                    const { done, value } = yield __await(reader.read());
                    if (done) {
                        if (buffer.trim().length > 0) {
                            throw new Error('Incomplete JSON segment at the end');
                        }
                        break;
                    }
                    const chunkString = decoder.decode(value);
                    // Parse and throw an error if the chunk contains an error.
                    try {
                        const chunkJson = JSON.parse(chunkString);
                        if ('error' in chunkJson) {
                            const errorJson = JSON.parse(JSON.stringify(chunkJson['error']));
                            const status = errorJson['status'];
                            const code = errorJson['code'];
                            const errorMessage = `got status: ${status}. ${JSON.stringify(chunkJson)}`;
                            if (code >= 400 && code < 500) {
                                const clientError = new ClientError(errorMessage);
                                throw clientError;
                            }
                            else if (code >= 500 && code < 600) {
                                const serverError = new ServerError(errorMessage);
                                throw serverError;
                            }
                        }
                    }
                    catch (e) {
                        const error = e;
                        if (error.name === 'ClientError' || error.name === 'ServerError') {
                            throw e;
                        }
                    }
                    buffer += chunkString;
                    let match = buffer.match(responseLineRE);
                    while (match) {
                        const processedChunkString = match[1];
                        try {
                            const partialResponse = new Response(processedChunkString, {
                                headers: response === null || response === void 0 ? void 0 : response.headers,
                                status: response === null || response === void 0 ? void 0 : response.status,
                                statusText: response === null || response === void 0 ? void 0 : response.statusText,
                            });
                            yield yield __await(new HttpResponse(partialResponse));
                            buffer = buffer.slice(match[0].length);
                            match = buffer.match(responseLineRE);
                        }
                        catch (e) {
                            throw new Error(`exception parsing stream chunk ${processedChunkString}. ${e}`);
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
        });
    }
    async apiCall(url, requestInit) {
        return fetch(url, requestInit).catch((e) => {
            throw new Error(`exception ${e} sending request`);
        });
    }
    getDefaultHeaders() {
        const headers = {};
        const versionHeaderValue = LIBRARY_LABEL + ' ' + this.clientOptions.userAgentExtra;
        headers[USER_AGENT_HEADER] = versionHeaderValue;
        headers[GOOGLE_API_CLIENT_HEADER] = versionHeaderValue;
        headers[CONTENT_TYPE_HEADER] = 'application/json';
        return headers;
    }
    async getHeadersInternal(httpOptions) {
        const headers = new Headers();
        if (httpOptions && httpOptions.headers) {
            for (const [key, value] of Object.entries(httpOptions.headers)) {
                headers.append(key, value);
            }
            // Append a timeout header if it is set, note that the timeout option is
            // in milliseconds but the header is in seconds.
            if (httpOptions.timeout && httpOptions.timeout > 0) {
                headers.append(SERVER_TIMEOUT_HEADER, String(Math.ceil(httpOptions.timeout / 1000)));
            }
        }
        await this.clientOptions.auth.addAuthHeaders(headers);
        return headers;
    }
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
    async uploadFile(file, config) {
        var _a;
        const fileToUpload = {};
        if (config != null) {
            fileToUpload.mimeType = config.mimeType;
            fileToUpload.name = config.name;
            fileToUpload.displayName = config.displayName;
        }
        if (fileToUpload.name && !fileToUpload.name.startsWith('files/')) {
            fileToUpload.name = `files/${fileToUpload.name}`;
        }
        const uploader = this.clientOptions.uploader;
        const fileStat = await uploader.stat(file);
        fileToUpload.sizeBytes = String(fileStat.size);
        const mimeType = (_a = config === null || config === void 0 ? void 0 : config.mimeType) !== null && _a !== void 0 ? _a : fileStat.type;
        if (mimeType === undefined || mimeType === '') {
            throw new Error('Can not determine mimeType. Please provide mimeType in the config.');
        }
        fileToUpload.mimeType = mimeType;
        const uploadUrl = await this.fetchUploadUrl(fileToUpload, config);
        return uploader.upload(file, uploadUrl, this);
    }
    /**
     * Downloads a file asynchronously to the specified path.
     *
     * @params params - The parameters for the download request, see {@link
     * DownloadFileParameters}
     */
    async downloadFile(params) {
        const downloader = this.clientOptions.downloader;
        await downloader.download(params, this);
    }
    async fetchUploadUrl(file, config) {
        var _a;
        let httpOptions = {};
        if (config === null || config === void 0 ? void 0 : config.httpOptions) {
            httpOptions = config.httpOptions;
        }
        else {
            httpOptions = {
                apiVersion: '',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Upload-Protocol': 'resumable',
                    'X-Goog-Upload-Command': 'start',
                    'X-Goog-Upload-Header-Content-Length': `${file.sizeBytes}`,
                    'X-Goog-Upload-Header-Content-Type': `${file.mimeType}`,
                },
            };
        }
        const body = {
            'file': file,
        };
        const httpResponse = await this.request({
            path: formatMap('upload/v1beta/files', body['_url']),
            body: JSON.stringify(body),
            httpMethod: 'POST',
            httpOptions,
        });
        if (!httpResponse || !(httpResponse === null || httpResponse === void 0 ? void 0 : httpResponse.headers)) {
            throw new Error('Server did not return an HttpResponse or the returned HttpResponse did not have headers.');
        }
        const uploadUrl = (_a = httpResponse === null || httpResponse === void 0 ? void 0 : httpResponse.headers) === null || _a === void 0 ? void 0 : _a['x-goog-upload-url'];
        if (uploadUrl === undefined) {
            throw new Error('Failed to get upload url. Server did not return the x-google-upload-url in the headers');
        }
        return uploadUrl;
    }
}
async function throwErrorIfNotOK(response) {
    var _a;
    if (response === undefined) {
        throw new ServerError('response is undefined');
    }
    if (!response.ok) {
        const status = response.status;
        const statusText = response.statusText;
        let errorBody;
        if ((_a = response.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.includes('application/json')) {
            errorBody = await response.json();
        }
        else {
            errorBody = {
                error: {
                    message: await response.text(),
                    code: response.status,
                    status: response.statusText,
                },
            };
        }
        const errorMessage = `got status: ${status} ${statusText}. ${JSON.stringify(errorBody)}`;
        if (status >= 400 && status < 500) {
            const clientError = new ClientError(errorMessage);
            throw clientError;
        }
        else if (status >= 500 && status < 600) {
            const serverError = new ServerError(errorMessage);
            throw serverError;
        }
        throw new Error(errorMessage);
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function getTuningJobParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], fromName);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function listTuningJobsConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromPageSize = getValueByPath(fromObject, ['pageSize']);
    if (parentObject !== undefined && fromPageSize != null) {
        setValueByPath(parentObject, ['_query', 'pageSize'], fromPageSize);
    }
    const fromPageToken = getValueByPath(fromObject, ['pageToken']);
    if (parentObject !== undefined && fromPageToken != null) {
        setValueByPath(parentObject, ['_query', 'pageToken'], fromPageToken);
    }
    const fromFilter = getValueByPath(fromObject, ['filter']);
    if (parentObject !== undefined && fromFilter != null) {
        setValueByPath(parentObject, ['_query', 'filter'], fromFilter);
    }
    return toObject;
}
function listTuningJobsParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], listTuningJobsConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function tuningExampleToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromTextInput = getValueByPath(fromObject, ['textInput']);
    if (fromTextInput != null) {
        setValueByPath(toObject, ['textInput'], fromTextInput);
    }
    const fromOutput = getValueByPath(fromObject, ['output']);
    if (fromOutput != null) {
        setValueByPath(toObject, ['output'], fromOutput);
    }
    return toObject;
}
function tuningDatasetToMldev(apiClient, fromObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['gcsUri']) !== undefined) {
        throw new Error('gcsUri parameter is not supported in Gemini API.');
    }
    const fromExamples = getValueByPath(fromObject, ['examples']);
    if (fromExamples != null) {
        let transformedList = fromExamples;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return tuningExampleToMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['examples', 'examples'], transformedList);
    }
    return toObject;
}
function createTuningJobConfigToMldev(apiClient, fromObject, parentObject) {
    const toObject = {};
    if (getValueByPath(fromObject, ['validationDataset']) !== undefined) {
        throw new Error('validationDataset parameter is not supported in Gemini API.');
    }
    const fromTunedModelDisplayName = getValueByPath(fromObject, [
        'tunedModelDisplayName',
    ]);
    if (parentObject !== undefined && fromTunedModelDisplayName != null) {
        setValueByPath(parentObject, ['displayName'], fromTunedModelDisplayName);
    }
    if (getValueByPath(fromObject, ['description']) !== undefined) {
        throw new Error('description parameter is not supported in Gemini API.');
    }
    const fromEpochCount = getValueByPath(fromObject, ['epochCount']);
    if (parentObject !== undefined && fromEpochCount != null) {
        setValueByPath(parentObject, ['tuningTask', 'hyperparameters', 'epochCount'], fromEpochCount);
    }
    const fromLearningRateMultiplier = getValueByPath(fromObject, [
        'learningRateMultiplier',
    ]);
    if (fromLearningRateMultiplier != null) {
        setValueByPath(toObject, ['tuningTask', 'hyperparameters', 'learningRateMultiplier'], fromLearningRateMultiplier);
    }
    if (getValueByPath(fromObject, ['adapterSize']) !== undefined) {
        throw new Error('adapterSize parameter is not supported in Gemini API.');
    }
    const fromBatchSize = getValueByPath(fromObject, ['batchSize']);
    if (parentObject !== undefined && fromBatchSize != null) {
        setValueByPath(parentObject, ['tuningTask', 'hyperparameters', 'batchSize'], fromBatchSize);
    }
    const fromLearningRate = getValueByPath(fromObject, ['learningRate']);
    if (parentObject !== undefined && fromLearningRate != null) {
        setValueByPath(parentObject, ['tuningTask', 'hyperparameters', 'learningRate'], fromLearningRate);
    }
    return toObject;
}
function createTuningJobParametersToMldev(apiClient, fromObject) {
    const toObject = {};
    const fromBaseModel = getValueByPath(fromObject, ['baseModel']);
    if (fromBaseModel != null) {
        setValueByPath(toObject, ['baseModel'], fromBaseModel);
    }
    const fromTrainingDataset = getValueByPath(fromObject, [
        'trainingDataset',
    ]);
    if (fromTrainingDataset != null) {
        setValueByPath(toObject, ['tuningTask', 'trainingData'], tuningDatasetToMldev(apiClient, fromTrainingDataset));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], createTuningJobConfigToMldev(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function getTuningJobParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['_url', 'name'], fromName);
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], fromConfig);
    }
    return toObject;
}
function listTuningJobsConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromPageSize = getValueByPath(fromObject, ['pageSize']);
    if (parentObject !== undefined && fromPageSize != null) {
        setValueByPath(parentObject, ['_query', 'pageSize'], fromPageSize);
    }
    const fromPageToken = getValueByPath(fromObject, ['pageToken']);
    if (parentObject !== undefined && fromPageToken != null) {
        setValueByPath(parentObject, ['_query', 'pageToken'], fromPageToken);
    }
    const fromFilter = getValueByPath(fromObject, ['filter']);
    if (parentObject !== undefined && fromFilter != null) {
        setValueByPath(parentObject, ['_query', 'filter'], fromFilter);
    }
    return toObject;
}
function listTuningJobsParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], listTuningJobsConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function tuningDatasetToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromGcsUri = getValueByPath(fromObject, ['gcsUri']);
    if (parentObject !== undefined && fromGcsUri != null) {
        setValueByPath(parentObject, ['supervisedTuningSpec', 'trainingDatasetUri'], fromGcsUri);
    }
    if (getValueByPath(fromObject, ['examples']) !== undefined) {
        throw new Error('examples parameter is not supported in Vertex AI.');
    }
    return toObject;
}
function tuningValidationDatasetToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromGcsUri = getValueByPath(fromObject, ['gcsUri']);
    if (fromGcsUri != null) {
        setValueByPath(toObject, ['validationDatasetUri'], fromGcsUri);
    }
    return toObject;
}
function createTuningJobConfigToVertex(apiClient, fromObject, parentObject) {
    const toObject = {};
    const fromValidationDataset = getValueByPath(fromObject, [
        'validationDataset',
    ]);
    if (parentObject !== undefined && fromValidationDataset != null) {
        setValueByPath(parentObject, ['supervisedTuningSpec'], tuningValidationDatasetToVertex(apiClient, fromValidationDataset));
    }
    const fromTunedModelDisplayName = getValueByPath(fromObject, [
        'tunedModelDisplayName',
    ]);
    if (parentObject !== undefined && fromTunedModelDisplayName != null) {
        setValueByPath(parentObject, ['tunedModelDisplayName'], fromTunedModelDisplayName);
    }
    const fromDescription = getValueByPath(fromObject, ['description']);
    if (parentObject !== undefined && fromDescription != null) {
        setValueByPath(parentObject, ['description'], fromDescription);
    }
    const fromEpochCount = getValueByPath(fromObject, ['epochCount']);
    if (parentObject !== undefined && fromEpochCount != null) {
        setValueByPath(parentObject, ['supervisedTuningSpec', 'hyperParameters', 'epochCount'], fromEpochCount);
    }
    const fromLearningRateMultiplier = getValueByPath(fromObject, [
        'learningRateMultiplier',
    ]);
    if (parentObject !== undefined && fromLearningRateMultiplier != null) {
        setValueByPath(parentObject, ['supervisedTuningSpec', 'hyperParameters', 'learningRateMultiplier'], fromLearningRateMultiplier);
    }
    const fromAdapterSize = getValueByPath(fromObject, ['adapterSize']);
    if (parentObject !== undefined && fromAdapterSize != null) {
        setValueByPath(parentObject, ['supervisedTuningSpec', 'hyperParameters', 'adapterSize'], fromAdapterSize);
    }
    if (getValueByPath(fromObject, ['batchSize']) !== undefined) {
        throw new Error('batchSize parameter is not supported in Vertex AI.');
    }
    if (getValueByPath(fromObject, ['learningRate']) !== undefined) {
        throw new Error('learningRate parameter is not supported in Vertex AI.');
    }
    return toObject;
}
function createTuningJobParametersToVertex(apiClient, fromObject) {
    const toObject = {};
    const fromBaseModel = getValueByPath(fromObject, ['baseModel']);
    if (fromBaseModel != null) {
        setValueByPath(toObject, ['baseModel'], fromBaseModel);
    }
    const fromTrainingDataset = getValueByPath(fromObject, [
        'trainingDataset',
    ]);
    if (fromTrainingDataset != null) {
        setValueByPath(toObject, ['supervisedTuningSpec', 'trainingDatasetUri'], tuningDatasetToVertex(apiClient, fromTrainingDataset, toObject));
    }
    const fromConfig = getValueByPath(fromObject, ['config']);
    if (fromConfig != null) {
        setValueByPath(toObject, ['config'], createTuningJobConfigToVertex(apiClient, fromConfig, toObject));
    }
    return toObject;
}
function tunedModelFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['name']);
    if (fromModel != null) {
        setValueByPath(toObject, ['model'], fromModel);
    }
    const fromEndpoint = getValueByPath(fromObject, ['name']);
    if (fromEndpoint != null) {
        setValueByPath(toObject, ['endpoint'], fromEndpoint);
    }
    return toObject;
}
function tuningJobFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromState = getValueByPath(fromObject, ['state']);
    if (fromState != null) {
        setValueByPath(toObject, ['state'], tTuningJobStatus(apiClient, fromState));
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromStartTime = getValueByPath(fromObject, [
        'tuningTask',
        'startTime',
    ]);
    if (fromStartTime != null) {
        setValueByPath(toObject, ['startTime'], fromStartTime);
    }
    const fromEndTime = getValueByPath(fromObject, [
        'tuningTask',
        'completeTime',
    ]);
    if (fromEndTime != null) {
        setValueByPath(toObject, ['endTime'], fromEndTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    const fromDescription = getValueByPath(fromObject, ['description']);
    if (fromDescription != null) {
        setValueByPath(toObject, ['description'], fromDescription);
    }
    const fromBaseModel = getValueByPath(fromObject, ['baseModel']);
    if (fromBaseModel != null) {
        setValueByPath(toObject, ['baseModel'], fromBaseModel);
    }
    const fromTunedModel = getValueByPath(fromObject, ['_self']);
    if (fromTunedModel != null) {
        setValueByPath(toObject, ['tunedModel'], tunedModelFromMldev(apiClient, fromTunedModel));
    }
    const fromDistillationSpec = getValueByPath(fromObject, [
        'distillationSpec',
    ]);
    if (fromDistillationSpec != null) {
        setValueByPath(toObject, ['distillationSpec'], fromDistillationSpec);
    }
    const fromExperiment = getValueByPath(fromObject, ['experiment']);
    if (fromExperiment != null) {
        setValueByPath(toObject, ['experiment'], fromExperiment);
    }
    const fromLabels = getValueByPath(fromObject, ['labels']);
    if (fromLabels != null) {
        setValueByPath(toObject, ['labels'], fromLabels);
    }
    const fromPipelineJob = getValueByPath(fromObject, ['pipelineJob']);
    if (fromPipelineJob != null) {
        setValueByPath(toObject, ['pipelineJob'], fromPipelineJob);
    }
    const fromTunedModelDisplayName = getValueByPath(fromObject, [
        'tunedModelDisplayName',
    ]);
    if (fromTunedModelDisplayName != null) {
        setValueByPath(toObject, ['tunedModelDisplayName'], fromTunedModelDisplayName);
    }
    return toObject;
}
function listTuningJobsResponseFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromNextPageToken = getValueByPath(fromObject, [
        'nextPageToken',
    ]);
    if (fromNextPageToken != null) {
        setValueByPath(toObject, ['nextPageToken'], fromNextPageToken);
    }
    const fromTuningJobs = getValueByPath(fromObject, ['tunedModels']);
    if (fromTuningJobs != null) {
        let transformedList = fromTuningJobs;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return tuningJobFromMldev(apiClient, item);
            });
        }
        setValueByPath(toObject, ['tuningJobs'], transformedList);
    }
    return toObject;
}
function operationFromMldev(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromMetadata = getValueByPath(fromObject, ['metadata']);
    if (fromMetadata != null) {
        setValueByPath(toObject, ['metadata'], fromMetadata);
    }
    const fromDone = getValueByPath(fromObject, ['done']);
    if (fromDone != null) {
        setValueByPath(toObject, ['done'], fromDone);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fromError);
    }
    return toObject;
}
function tunedModelFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromModel = getValueByPath(fromObject, ['model']);
    if (fromModel != null) {
        setValueByPath(toObject, ['model'], fromModel);
    }
    const fromEndpoint = getValueByPath(fromObject, ['endpoint']);
    if (fromEndpoint != null) {
        setValueByPath(toObject, ['endpoint'], fromEndpoint);
    }
    return toObject;
}
function tuningJobFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromName = getValueByPath(fromObject, ['name']);
    if (fromName != null) {
        setValueByPath(toObject, ['name'], fromName);
    }
    const fromState = getValueByPath(fromObject, ['state']);
    if (fromState != null) {
        setValueByPath(toObject, ['state'], tTuningJobStatus(apiClient, fromState));
    }
    const fromCreateTime = getValueByPath(fromObject, ['createTime']);
    if (fromCreateTime != null) {
        setValueByPath(toObject, ['createTime'], fromCreateTime);
    }
    const fromStartTime = getValueByPath(fromObject, ['startTime']);
    if (fromStartTime != null) {
        setValueByPath(toObject, ['startTime'], fromStartTime);
    }
    const fromEndTime = getValueByPath(fromObject, ['endTime']);
    if (fromEndTime != null) {
        setValueByPath(toObject, ['endTime'], fromEndTime);
    }
    const fromUpdateTime = getValueByPath(fromObject, ['updateTime']);
    if (fromUpdateTime != null) {
        setValueByPath(toObject, ['updateTime'], fromUpdateTime);
    }
    const fromError = getValueByPath(fromObject, ['error']);
    if (fromError != null) {
        setValueByPath(toObject, ['error'], fromError);
    }
    const fromDescription = getValueByPath(fromObject, ['description']);
    if (fromDescription != null) {
        setValueByPath(toObject, ['description'], fromDescription);
    }
    const fromBaseModel = getValueByPath(fromObject, ['baseModel']);
    if (fromBaseModel != null) {
        setValueByPath(toObject, ['baseModel'], fromBaseModel);
    }
    const fromTunedModel = getValueByPath(fromObject, ['tunedModel']);
    if (fromTunedModel != null) {
        setValueByPath(toObject, ['tunedModel'], tunedModelFromVertex(apiClient, fromTunedModel));
    }
    const fromSupervisedTuningSpec = getValueByPath(fromObject, [
        'supervisedTuningSpec',
    ]);
    if (fromSupervisedTuningSpec != null) {
        setValueByPath(toObject, ['supervisedTuningSpec'], fromSupervisedTuningSpec);
    }
    const fromTuningDataStats = getValueByPath(fromObject, [
        'tuningDataStats',
    ]);
    if (fromTuningDataStats != null) {
        setValueByPath(toObject, ['tuningDataStats'], fromTuningDataStats);
    }
    const fromEncryptionSpec = getValueByPath(fromObject, [
        'encryptionSpec',
    ]);
    if (fromEncryptionSpec != null) {
        setValueByPath(toObject, ['encryptionSpec'], fromEncryptionSpec);
    }
    const fromPartnerModelTuningSpec = getValueByPath(fromObject, [
        'partnerModelTuningSpec',
    ]);
    if (fromPartnerModelTuningSpec != null) {
        setValueByPath(toObject, ['partnerModelTuningSpec'], fromPartnerModelTuningSpec);
    }
    const fromDistillationSpec = getValueByPath(fromObject, [
        'distillationSpec',
    ]);
    if (fromDistillationSpec != null) {
        setValueByPath(toObject, ['distillationSpec'], fromDistillationSpec);
    }
    const fromExperiment = getValueByPath(fromObject, ['experiment']);
    if (fromExperiment != null) {
        setValueByPath(toObject, ['experiment'], fromExperiment);
    }
    const fromLabels = getValueByPath(fromObject, ['labels']);
    if (fromLabels != null) {
        setValueByPath(toObject, ['labels'], fromLabels);
    }
    const fromPipelineJob = getValueByPath(fromObject, ['pipelineJob']);
    if (fromPipelineJob != null) {
        setValueByPath(toObject, ['pipelineJob'], fromPipelineJob);
    }
    const fromTunedModelDisplayName = getValueByPath(fromObject, [
        'tunedModelDisplayName',
    ]);
    if (fromTunedModelDisplayName != null) {
        setValueByPath(toObject, ['tunedModelDisplayName'], fromTunedModelDisplayName);
    }
    return toObject;
}
function listTuningJobsResponseFromVertex(apiClient, fromObject) {
    const toObject = {};
    const fromNextPageToken = getValueByPath(fromObject, [
        'nextPageToken',
    ]);
    if (fromNextPageToken != null) {
        setValueByPath(toObject, ['nextPageToken'], fromNextPageToken);
    }
    const fromTuningJobs = getValueByPath(fromObject, ['tuningJobs']);
    if (fromTuningJobs != null) {
        let transformedList = fromTuningJobs;
        if (Array.isArray(transformedList)) {
            transformedList = transformedList.map((item) => {
                return tuningJobFromVertex(apiClient, item);
            });
        }
        setValueByPath(toObject, ['tuningJobs'], transformedList);
    }
    return toObject;
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Tunings extends BaseModule {
    constructor(apiClient) {
        super();
        this.apiClient = apiClient;
        /**
         * Gets a TuningJob.
         *
         * @param name - The resource name of the tuning job.
         * @return - A TuningJob object.
         *
         * @experimental - The SDK's tuning implementation is experimental, and may
         * change in future versions.
         */
        this.get = async (params) => {
            return await this.getInternal(params);
        };
        /**
         * Lists tuning jobs.
         *
         * @param config - The configuration for the list request.
         * @return - A list of tuning jobs.
         *
         * @experimental - The SDK's tuning implementation is experimental, and may
         * change in future versions.
         */
        this.list = async (params = {}) => {
            return new Pager(PagedItem.PAGED_ITEM_TUNING_JOBS, (x) => this.listInternal(x), await this.listInternal(params), params);
        };
        /**
         * Creates a supervised fine-tuning job.
         *
         * @param params - The parameters for the tuning job.
         * @return - A TuningJob operation.
         *
         * @experimental - The SDK's tuning implementation is experimental, and may
         * change in future versions.
         */
        this.tune = async (params) => {
            if (this.apiClient.isVertexAI()) {
                return await this.tuneInternal(params);
            }
            else {
                const operation = await this.tuneMldevInternal(params);
                let tunedModelName = '';
                if (operation['metadata'] !== undefined &&
                    operation['metadata']['tunedModel'] !== undefined) {
                    tunedModelName = operation['metadata']['tunedModel'];
                }
                else if (operation['name'] !== undefined &&
                    operation['name'].includes('/operations/')) {
                    tunedModelName = operation['name'].split('/operations/')[0];
                }
                const tuningJob = {
                    name: tunedModelName,
                    state: JobState.JOB_STATE_QUEUED,
                };
                return tuningJob;
            }
        };
    }
    async getInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = getTuningJobParametersToVertex(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = tuningJobFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            const body = getTuningJobParametersToMldev(this.apiClient, params);
            path = formatMap('{name}', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = tuningJobFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
    async listInternal(params) {
        var _a, _b, _c, _d;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = listTuningJobsParametersToVertex(this.apiClient, params);
            path = formatMap('tuningJobs', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = listTuningJobsResponseFromVertex(this.apiClient, apiResponse);
                const typedResp = new ListTuningJobsResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
        else {
            const body = listTuningJobsParametersToMldev(this.apiClient, params);
            path = formatMap('tunedModels', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'GET',
                httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
                abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = listTuningJobsResponseFromMldev(this.apiClient, apiResponse);
                const typedResp = new ListTuningJobsResponse();
                Object.assign(typedResp, resp);
                return typedResp;
            });
        }
    }
    async tuneInternal(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            const body = createTuningJobParametersToVertex(this.apiClient, params);
            path = formatMap('tuningJobs', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = tuningJobFromVertex(this.apiClient, apiResponse);
                return resp;
            });
        }
        else {
            throw new Error('This method is only supported by the Vertex AI.');
        }
    }
    async tuneMldevInternal(params) {
        var _a, _b;
        let response;
        let path = '';
        let queryParams = {};
        if (this.apiClient.isVertexAI()) {
            throw new Error('This method is only supported by the Gemini Developer API.');
        }
        else {
            const body = createTuningJobParametersToMldev(this.apiClient, params);
            path = formatMap('tunedModels', body['_url']);
            queryParams = body['_query'];
            delete body['config'];
            delete body['_url'];
            delete body['_query'];
            response = this.apiClient
                .request({
                path: path,
                queryParams: queryParams,
                body: JSON.stringify(body),
                httpMethod: 'POST',
                httpOptions: (_a = params.config) === null || _a === void 0 ? void 0 : _a.httpOptions,
                abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal,
            })
                .then((httpResponse) => {
                return httpResponse.json();
            });
            return response.then((apiResponse) => {
                const resp = operationFromMldev(this.apiClient, apiResponse);
                return resp;
            });
        }
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class BrowserDownloader {
    async download(_params, _apiClient) {
        throw new Error('Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.');
    }
}

const MAX_CHUNK_SIZE = 1024 * 1024 * 8; // bytes
const MAX_RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const DELAY_MULTIPLIER = 2;
const X_GOOG_UPLOAD_STATUS_HEADER_FIELD = 'x-goog-upload-status';
async function uploadBlob(file, uploadUrl, apiClient) {
    var _a, _b, _c;
    let fileSize = 0;
    let offset = 0;
    let response = new HttpResponse(new Response());
    let uploadCommand = 'upload';
    fileSize = file.size;
    while (offset < fileSize) {
        const chunkSize = Math.min(MAX_CHUNK_SIZE, fileSize - offset);
        const chunk = file.slice(offset, offset + chunkSize);
        if (offset + chunkSize >= fileSize) {
            uploadCommand += ', finalize';
        }
        let retryCount = 0;
        let currentDelayMs = INITIAL_RETRY_DELAY_MS;
        while (retryCount < MAX_RETRY_COUNT) {
            response = await apiClient.request({
                path: '',
                body: chunk,
                httpMethod: 'POST',
                httpOptions: {
                    apiVersion: '',
                    baseUrl: uploadUrl,
                    headers: {
                        'X-Goog-Upload-Command': uploadCommand,
                        'X-Goog-Upload-Offset': String(offset),
                        'Content-Length': String(chunkSize),
                    },
                },
            });
            if ((_a = response === null || response === void 0 ? void 0 : response.headers) === null || _a === void 0 ? void 0 : _a[X_GOOG_UPLOAD_STATUS_HEADER_FIELD]) {
                break;
            }
            retryCount++;
            await sleep(currentDelayMs);
            currentDelayMs = currentDelayMs * DELAY_MULTIPLIER;
        }
        offset += chunkSize;
        // The `x-goog-upload-status` header field can be `active`, `final` and
        //`cancelled` in resposne.
        if (((_b = response === null || response === void 0 ? void 0 : response.headers) === null || _b === void 0 ? void 0 : _b[X_GOOG_UPLOAD_STATUS_HEADER_FIELD]) !== 'active') {
            break;
        }
        // TODO(b/401391430) Investigate why the upload status is not finalized
        // even though all content has been uploaded.
        if (fileSize <= offset) {
            throw new Error('All content has been uploaded, but the upload status is not finalized.');
        }
    }
    const responseJson = (await (response === null || response === void 0 ? void 0 : response.json()));
    if (((_c = response === null || response === void 0 ? void 0 : response.headers) === null || _c === void 0 ? void 0 : _c[X_GOOG_UPLOAD_STATUS_HEADER_FIELD]) !== 'final') {
        throw new Error('Failed to upload file: Upload status is not finalized.');
    }
    return responseJson['file'];
}
async function getBlobStat(file) {
    const fileStat = { size: file.size, type: file.type };
    return fileStat;
}
function sleep(ms) {
    return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

class BrowserUploader {
    async upload(file, uploadUrl, apiClient) {
        if (typeof file === 'string') {
            throw new Error('File path is not supported in browser uploader.');
        }
        return await uploadBlob(file, uploadUrl, apiClient);
    }
    async stat(file) {
        if (typeof file === 'string') {
            throw new Error('File path is not supported in browser uploader.');
        }
        else {
            return await getBlobStat(file);
        }
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// TODO((b/401271082): re-enable lint once BrowserWebSocketFactory is
// implemented.
/*  eslint-disable @typescript-eslint/no-unused-vars */
class BrowserWebSocketFactory {
    create(url, headers, callbacks) {
        return new BrowserWebSocket(url, headers, callbacks);
    }
}
class BrowserWebSocket {
    constructor(url, headers, callbacks) {
        this.url = url;
        this.headers = headers;
        this.callbacks = callbacks;
    }
    connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.callbacks.onopen;
        this.ws.onerror = this.callbacks.onerror;
        this.ws.onclose = this.callbacks.onclose;
        this.ws.onmessage = this.callbacks.onmessage;
    }
    send(message) {
        if (this.ws === undefined) {
            throw new Error('WebSocket is not connected');
        }
        this.ws.send(message);
    }
    close() {
        if (this.ws === undefined) {
            throw new Error('WebSocket is not connected');
        }
        this.ws.close();
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const GOOGLE_API_KEY_HEADER = 'x-goog-api-key';
// TODO(b/395122533): We need a secure client side authentication mechanism.
class WebAuth {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async addAuthHeaders(headers) {
        if (headers.get(GOOGLE_API_KEY_HEADER) !== null) {
            return;
        }
        headers.append(GOOGLE_API_KEY_HEADER, this.apiKey);
    }
}

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const LANGUAGE_LABEL_PREFIX = 'gl-node/';
/**
 * The Google GenAI SDK.
 *
 * @remarks
 * Provides access to the GenAI features through either the {@link
 * https://cloud.google.com/vertex-ai/docs/reference/rest | Gemini API} or
 * the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Vertex AI
 * API}.
 *
 * The {@link GoogleGenAIOptions.vertexai} value determines which of the API
 * services to use.
 *
 * When using the Gemini API, a {@link GoogleGenAIOptions.apiKey} must also be
 * set. When using Vertex AI, currently only {@link GoogleGenAIOptions.apiKey}
 * is supported via Express mode. {@link GoogleGenAIOptions.project} and {@link
 * GoogleGenAIOptions.location} should not be set.
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
class GoogleGenAI {
    constructor(options) {
        var _a;
        if (options.apiKey == null) {
            throw new Error('An API Key must be set when running in a browser');
        }
        // Web client only supports API key mode for Vertex AI.
        if (options.project || options.location) {
            throw new Error('Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.');
        }
        this.vertexai = (_a = options.vertexai) !== null && _a !== void 0 ? _a : false;
        this.apiKey = options.apiKey;
        const baseUrl = getBaseUrl(options, 
        /*vertexBaseUrlFromEnv*/ undefined, 
        /*geminiBaseUrlFromEnv*/ undefined);
        if (baseUrl) {
            if (options.httpOptions) {
                options.httpOptions.baseUrl = baseUrl;
            }
            else {
                options.httpOptions = { baseUrl: baseUrl };
            }
        }
        this.apiVersion = options.apiVersion;
        const auth = new WebAuth(this.apiKey);
        this.apiClient = new ApiClient({
            auth: auth,
            apiVersion: this.apiVersion,
            apiKey: this.apiKey,
            vertexai: this.vertexai,
            httpOptions: options.httpOptions,
            userAgentExtra: LANGUAGE_LABEL_PREFIX + 'web',
            uploader: new BrowserUploader(),
            downloader: new BrowserDownloader(),
        });
        this.models = new Models(this.apiClient);
        this.live = new Live(this.apiClient, auth, new BrowserWebSocketFactory());
        this.chats = new Chats(this.models, this.apiClient);
        this.caches = new Caches(this.apiClient);
        this.files = new Files(this.apiClient);
        this.operations = new Operations(this.apiClient);
        this.tunings = new Tunings(this.apiClient);
    }
}

export { ActivityHandling, AdapterSize, AuthType, BlockedReason, Caches, Chat, Chats, ComputeTokensResponse, ControlReferenceType, CountTokensResponse, CreateFileResponse, DeleteCachedContentResponse, DeleteFileResponse, DeleteModelResponse, DynamicRetrievalConfigMode, EmbedContentResponse, EndSensitivity, FeatureSelectionPreference, FileSource, FileState, Files, FinishReason, FunctionCallingConfigMode, FunctionResponse, GenerateContentResponse, GenerateContentResponsePromptFeedback, GenerateContentResponseUsageMetadata, GenerateImagesResponse, GenerateVideosResponse, GoogleGenAI, HarmBlockMethod, HarmBlockThreshold, HarmCategory, HarmProbability, HarmSeverity, HttpResponse, ImagePromptLanguage, JobState, Language, ListCachedContentsResponse, ListFilesResponse, ListModelsResponse, ListTuningJobsResponse, Live, LiveClientToolResponse, LiveSendToolResponseParameters, LiveServerMessage, MaskReferenceMode, MediaModality, MediaResolution, Modality, Mode, Models, Operations, Outcome, PagedItem, Pager, PersonGeneration, ReplayResponse, SafetyFilterLevel, Session, StartSensitivity, SubjectReferenceType, TrafficType, TurnCoverage, Type, createModelContent, createPartFromBase64, createPartFromCodeExecutionResult, createPartFromExecutableCode, createPartFromFunctionCall, createPartFromFunctionResponse, createPartFromText, createPartFromUri, createUserContent, setDefaultBaseUrls };
//# sourceMappingURL=index.mjs.map
