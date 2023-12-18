/* tslint:disable */
/* eslint-disable */
/**
 * OpenAPI definition
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { Configuration } from './configuration';
import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from './base';

/**
 * 
 * @export
 * @interface DismissNotificationsDto
 */
export interface DismissNotificationsDto {
    /**
     * 
     * @type {Array<string>}
     * @memberof DismissNotificationsDto
     */
    statuses?: Array<DismissNotificationsDtoStatusesEnum>;
}

/**
    * @export
    * @enum {string}
    */
export enum DismissNotificationsDtoStatusesEnum {
    Unread = 'UNREAD',
    Read = 'READ',
    Dismissed = 'DISMISSED'
}

/**
 * 
 * @export
 * @interface InlineObject
 */
export interface InlineObject {
    /**
     * 
     * @type {Pageable}
     * @memberof InlineObject
     */
    pageable?: Pageable;
    /**
     * 
     * @type {DismissNotificationsDto}
     * @memberof InlineObject
     */
    dismissNotificationsDto?: DismissNotificationsDto;
}
/**
 * 
 * @export
 * @interface Notification
 */
export interface Notification {
    /**
     * 
     * @type {number}
     * @memberof Notification
     */
    id?: number;
    /**
     * 
     * @type {number}
     * @memberof Notification
     */
    userId?: number;
    /**
     * 
     * @type {number}
     * @memberof Notification
     */
    accountId?: number;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    notificationStatus?: NotificationNotificationStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    summary?: string;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    message?: string;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    notificationType?: NotificationNotificationTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    notificationSource?: NotificationNotificationSourceEnum;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    entityType?: string;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    entityId?: string;
    /**
     * 
     * @type {string}
     * @memberof Notification
     */
    messageDateTime?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum NotificationNotificationStatusEnum {
    Unread = 'UNREAD',
    Read = 'READ',
    Dismissed = 'DISMISSED'
}
/**
    * @export
    * @enum {string}
    */
export enum NotificationNotificationTypeEnum {
    Info = 'INFO',
    ActionNeeded = 'ACTION_NEEDED',
    Error = 'ERROR'
}
/**
    * @export
    * @enum {string}
    */
export enum NotificationNotificationSourceEnum {
    GatewayService = 'GATEWAY_SERVICE',
    InvoiceService = 'INVOICE_SERVICE',
    NotificationService = 'NOTIFICATION_SERVICE',
    ProductService = 'PRODUCT_SERVICE',
    ReportingService = 'REPORTING_SERVICE',
    SchedulerService = 'SCHEDULER_SERVICE',
    SupplierService = 'SUPPLIER_SERVICE',
    ShopifyService = 'SHOPIFY_SERVICE',
    AmazonService = 'AMAZON_SERVICE',
    UserService = 'USER_SERVICE',
    XeroService = 'XERO_SERVICE',
    OrdersService = 'ORDERS_SERVICE'
}

/**
 * 
 * @export
 * @interface NotificationUpdateStatusDto
 */
export interface NotificationUpdateStatusDto {
    /**
     * 
     * @type {number}
     * @memberof NotificationUpdateStatusDto
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof NotificationUpdateStatusDto
     */
    notificationStatus?: NotificationUpdateStatusDtoNotificationStatusEnum;
}

/**
    * @export
    * @enum {string}
    */
export enum NotificationUpdateStatusDtoNotificationStatusEnum {
    Unread = 'UNREAD',
    Read = 'READ',
    Dismissed = 'DISMISSED'
}

/**
 * 
 * @export
 * @interface PageNotification
 */
export interface PageNotification {
    /**
     * 
     * @type {number}
     * @memberof PageNotification
     */
    totalPages?: number;
    /**
     * 
     * @type {number}
     * @memberof PageNotification
     */
    totalElements?: number;
    /**
     * 
     * @type {number}
     * @memberof PageNotification
     */
    size?: number;
    /**
     * 
     * @type {Array<Notification>}
     * @memberof PageNotification
     */
    content?: Array<Notification>;
    /**
     * 
     * @type {number}
     * @memberof PageNotification
     */
    number?: number;
    /**
     * 
     * @type {Sort}
     * @memberof PageNotification
     */
    sort?: Sort;
    /**
     * 
     * @type {number}
     * @memberof PageNotification
     */
    numberOfElements?: number;
    /**
     * 
     * @type {Pageable}
     * @memberof PageNotification
     */
    pageable?: Pageable;
    /**
     * 
     * @type {boolean}
     * @memberof PageNotification
     */
    first?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PageNotification
     */
    last?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PageNotification
     */
    empty?: boolean;
}
/**
 * 
 * @export
 * @interface Pageable
 */
export interface Pageable {
    /**
     * 
     * @type {number}
     * @memberof Pageable
     */
    offset?: number;
    /**
     * 
     * @type {Sort}
     * @memberof Pageable
     */
    sort?: Sort;
    /**
     * 
     * @type {number}
     * @memberof Pageable
     */
    pageNumber?: number;
    /**
     * 
     * @type {number}
     * @memberof Pageable
     */
    pageSize?: number;
    /**
     * 
     * @type {boolean}
     * @memberof Pageable
     */
    paged?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Pageable
     */
    unpaged?: boolean;
}
/**
 * 
 * @export
 * @interface Sort
 */
export interface Sort {
    /**
     * 
     * @type {boolean}
     * @memberof Sort
     */
    sorted?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Sort
     */
    unsorted?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Sort
     */
    empty?: boolean;
}
/**
 * 
 * @export
 * @interface SseEmitter
 */
export interface SseEmitter {
    /**
     * 
     * @type {number}
     * @memberof SseEmitter
     */
    timeout?: number;
}

/**
 * NotificationsAdminControllerApi - axios parameter creator
 * @export
 */
export const NotificationsAdminControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAdminNotificationsForUser: async (userId: number, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('getAdminNotificationsForUser', 'userId', userId)
            const localVarPath = `/admin/notifications/{userId}`
                .replace(`{${"userId"}}`, encodeURIComponent(String(userId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * NotificationsAdminControllerApi - functional programming interface
 * @export
 */
export const NotificationsAdminControllerApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = NotificationsAdminControllerApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAdminNotificationsForUser(userId: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getAdminNotificationsForUser(userId, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * NotificationsAdminControllerApi - factory interface
 * @export
 */
export const NotificationsAdminControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = NotificationsAdminControllerApiFp(configuration)
    return {
        /**
         * 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAdminNotificationsForUser(userId: number, options?: any): AxiosPromise<string> {
            return localVarFp.getAdminNotificationsForUser(userId, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * NotificationsAdminControllerApi - object-oriented interface
 * @export
 * @class NotificationsAdminControllerApi
 * @extends {BaseAPI}
 */
export class NotificationsAdminControllerApi extends BaseAPI {
    /**
     * 
     * @param {number} userId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NotificationsAdminControllerApi
     */
    public getAdminNotificationsForUser(userId: number, options?: any) {
        return NotificationsAdminControllerApiFp(this.configuration).getAdminNotificationsForUser(userId, options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * NotificationsControllerApi - axios parameter creator
 * @export
 */
export const NotificationsControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {number} userId 
         * @param {InlineObject} [inlineObject] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dismissNotificationsForUser: async (userId: number, inlineObject?: InlineObject, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('dismissNotificationsForUser', 'userId', userId)
            const localVarPath = `/notifications/{userId}/dismiss`
                .replace(`{${"userId"}}`, encodeURIComponent(String(userId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(inlineObject, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {Pageable} pageable 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getNotificationsForUser: async (pageable: Pageable, userId: number, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'pageable' is not null or undefined
            assertParamExists('getNotificationsForUser', 'pageable', pageable)
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('getNotificationsForUser', 'userId', userId)
            const localVarPath = `/notifications/{userId}`
                .replace(`{${"userId"}}`, encodeURIComponent(String(userId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (pageable !== undefined) {
                localVarQueryParameter['pageable'] = pageable;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {number} userId 
         * @param {Notification} [notification] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        publishNotification: async (userId: number, notification?: Notification, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('publishNotification', 'userId', userId)
            const localVarPath = `/notifications/{userId}`
                .replace(`{${"userId"}}`, encodeURIComponent(String(userId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(notification, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        subscribeToNotifications: async (userId: number, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('subscribeToNotifications', 'userId', userId)
            const localVarPath = `/notifications/{userId}/subscribe`
                .replace(`{${"userId"}}`, encodeURIComponent(String(userId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {number} userId 
         * @param {number} notificationId 
         * @param {NotificationUpdateStatusDto} [notificationUpdateStatusDto] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateNotificationStatus: async (userId: number, notificationId: number, notificationUpdateStatusDto?: NotificationUpdateStatusDto, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('updateNotificationStatus', 'userId', userId)
            // verify required parameter 'notificationId' is not null or undefined
            assertParamExists('updateNotificationStatus', 'notificationId', notificationId)
            const localVarPath = `/notifications/{userId}/{notificationId}`
                .replace(`{${"userId"}}`, encodeURIComponent(String(userId)))
                .replace(`{${"notificationId"}}`, encodeURIComponent(String(notificationId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PATCH', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(notificationUpdateStatusDto, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * NotificationsControllerApi - functional programming interface
 * @export
 */
export const NotificationsControllerApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = NotificationsControllerApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {number} userId 
         * @param {InlineObject} [inlineObject] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async dismissNotificationsForUser(userId: number, inlineObject?: InlineObject, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<PageNotification>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.dismissNotificationsForUser(userId, inlineObject, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @param {Pageable} pageable 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getNotificationsForUser(pageable: Pageable, userId: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<PageNotification>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getNotificationsForUser(pageable, userId, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @param {number} userId 
         * @param {Notification} [notification] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async publishNotification(userId: number, notification?: Notification, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Notification>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.publishNotification(userId, notification, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async subscribeToNotifications(userId: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SseEmitter>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.subscribeToNotifications(userId, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @param {number} userId 
         * @param {number} notificationId 
         * @param {NotificationUpdateStatusDto} [notificationUpdateStatusDto] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async updateNotificationStatus(userId: number, notificationId: number, notificationUpdateStatusDto?: NotificationUpdateStatusDto, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Notification>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.updateNotificationStatus(userId, notificationId, notificationUpdateStatusDto, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * NotificationsControllerApi - factory interface
 * @export
 */
export const NotificationsControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = NotificationsControllerApiFp(configuration)
    return {
        /**
         * 
         * @param {number} userId 
         * @param {InlineObject} [inlineObject] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dismissNotificationsForUser(userId: number, inlineObject?: InlineObject, options?: any): AxiosPromise<PageNotification> {
            return localVarFp.dismissNotificationsForUser(userId, inlineObject, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {Pageable} pageable 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getNotificationsForUser(pageable: Pageable, userId: number, options?: any): AxiosPromise<PageNotification> {
            return localVarFp.getNotificationsForUser(pageable, userId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {number} userId 
         * @param {Notification} [notification] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        publishNotification(userId: number, notification?: Notification, options?: any): AxiosPromise<Notification> {
            return localVarFp.publishNotification(userId, notification, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {number} userId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        subscribeToNotifications(userId: number, options?: any): AxiosPromise<SseEmitter> {
            return localVarFp.subscribeToNotifications(userId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {number} userId 
         * @param {number} notificationId 
         * @param {NotificationUpdateStatusDto} [notificationUpdateStatusDto] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateNotificationStatus(userId: number, notificationId: number, notificationUpdateStatusDto?: NotificationUpdateStatusDto, options?: any): AxiosPromise<Notification> {
            return localVarFp.updateNotificationStatus(userId, notificationId, notificationUpdateStatusDto, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * NotificationsControllerApi - object-oriented interface
 * @export
 * @class NotificationsControllerApi
 * @extends {BaseAPI}
 */
export class NotificationsControllerApi extends BaseAPI {
    /**
     * 
     * @param {number} userId 
     * @param {InlineObject} [inlineObject] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NotificationsControllerApi
     */
    public dismissNotificationsForUser(userId: number, inlineObject?: InlineObject, options?: any) {
        return NotificationsControllerApiFp(this.configuration).dismissNotificationsForUser(userId, inlineObject, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {Pageable} pageable 
     * @param {number} userId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NotificationsControllerApi
     */
    public getNotificationsForUser(pageable: Pageable, userId: number, options?: any) {
        return NotificationsControllerApiFp(this.configuration).getNotificationsForUser(pageable, userId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {number} userId 
     * @param {Notification} [notification] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NotificationsControllerApi
     */
    public publishNotification(userId: number, notification?: Notification, options?: any) {
        return NotificationsControllerApiFp(this.configuration).publishNotification(userId, notification, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {number} userId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NotificationsControllerApi
     */
    public subscribeToNotifications(userId: number, options?: any) {
        return NotificationsControllerApiFp(this.configuration).subscribeToNotifications(userId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {number} userId 
     * @param {number} notificationId 
     * @param {NotificationUpdateStatusDto} [notificationUpdateStatusDto] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NotificationsControllerApi
     */
    public updateNotificationStatus(userId: number, notificationId: number, notificationUpdateStatusDto?: NotificationUpdateStatusDto, options?: any) {
        return NotificationsControllerApiFp(this.configuration).updateNotificationStatus(userId, notificationId, notificationUpdateStatusDto, options).then((request) => request(this.axios, this.basePath));
    }
}


