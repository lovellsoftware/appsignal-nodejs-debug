/// <reference types="node" />
import { AppsignalOptions } from "./config/options";
interface FileMetadata {
    content?: string[];
    exists: boolean;
    mode?: string;
    ownership?: {
        gid: number;
        uid: number;
    };
    path?: string;
    type?: string;
    writable?: boolean;
}
export declare class DiagnoseTool {
    #private;
    constructor();
    /**
     * Reports are serialized to JSON and send to an endpoint that expects
     * snake_case keys, thus the keys in the report on this side must be snake cased also.
     */
    generate(): Promise<{
        library: {
            language: string;
            package_version: any;
            agent_version: any;
            extension_loaded: boolean;
        };
        installation: any;
        host: {
            architecture: NodeJS.Architecture;
            os: NodeJS.Platform;
            os_distribution: string;
            language_version: string;
            heroku: boolean;
            root: boolean;
            running_in_container: boolean;
        };
        agent: object;
        config: {
            options: Partial<AppsignalOptions>;
            sources: Record<string, Partial<AppsignalOptions>>;
        };
        validation: {
            push_api_key: undefined;
        };
        process: {
            uid: number;
        };
        paths: {
            [key: string]: FileMetadata;
        };
    }>;
    private getLibraryData;
    private getHostData;
    private getOsDistribution;
    private getInstallationReport;
    private validatePushApiKey;
    private getPathsData;
    /**
     * Reads all configuration and re-maps it to keys with
     * snake_case names.
     */
    private getConfigData;
    /**
     * If it can load the client from the `appsignal.cjs` file, get the config
     * object from the initialized client. Otherwise, return a default config object.
     */
    private getConfigObject;
    private clientFilePath;
    /**
     * Converts an AppsignalOptions object into a plain JS object,
     * re-mapping its keys to snake_case names as they appear
     * in our API.
     */
    private optionsObject;
    /**
     * Reads all configuration sources, remapping each source's
     * option keys with snake_case names.
     */
    private getSources;
    private getCustomClientFilePath;
    sendReport(data: Record<string, any>): Promise<void>;
}
export {};
