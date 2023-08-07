import { AppsignalOptions } from "./config/options";
/**
 * The AppSignal configuration object.
 *
 * Manages configuration loaded at runtime, and from other sources.
 * Writes environment variables used to configure the agent.
 *
 * @class
 */
export declare class Configuration {
    data: Partial<AppsignalOptions>;
    sources: Record<string, Partial<AppsignalOptions>>;
    constructor(options: Partial<AppsignalOptions>);
    /**
     * Returns `true` if the current configuration is valid.
     */
    get isValid(): boolean;
    get logFilePath(): string | undefined;
    static get clientFilePath(): string | undefined;
    static clientFilePaths(): string[];
    /**
     * Returns default OS tmp dir. Uses OS package for Windows. Linux and macOS
     * have `/tmp` hardcoded as a default
     *
     * @private
     */
    private _tmpdir;
    /**
     * Explicit default configuration values
     *
     * @private
     */
    private _defaultValues;
    /**
     * Config options based on the host environment.
     *
     * @private
     */
    private _systemValues;
    /**
     * Loads environment variables into a key-value structure.
     *
     * @private
     */
    private _loadFromEnvironment;
    /**
     * Writes environment variables from a key-value structure.
     *
     * @private
     */
    private writePrivateConfig;
    /**
     * Writes private environment variables that are not user configured,
     * and static in the lifecycle of the agent.
     *
     * @function
     * @private
     */
    private writePrivateConstants;
}
