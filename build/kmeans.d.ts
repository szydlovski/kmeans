export declare type DataCluster<DataType> = {
    mean: DataType;
    points: DataType[];
    totalError: number;
};
export declare function kMeans<T extends number[]>(data: T[], count?: number, iterations?: number): DataCluster<T>[];
