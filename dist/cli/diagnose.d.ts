export declare class Diagnose {
    #private;
    constructor();
    run(): Promise<void>;
    sendReport(data: object): Promise<void>;
    printAgentDiagnose(report: Record<string, any>): void;
    printAgentTest(definition: Record<string, any>, test: Record<string, any>): void;
    agentDiagnosticTestDefinition(): Record<string, any>;
    printConfiguration({ options, sources }: {
        options: {
            [key: string]: any;
        };
        sources: {
            [source: string]: {
                [key: string]: any;
            };
        };
    }, clientFilePath: string): void;
    configurationKeySources(key: string, sources: {
        [source: string]: {
            [key: string]: any;
        };
    }): {
        [source: string]: any;
    };
    print_newline(): void;
    colorize(value: string): string;
}
