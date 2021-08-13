export declare type DataPoint = number[];
export declare type DataCluster = {
    mean: DataPoint;
    points: DataPoint[];
    totalError: number;
};
export declare function kMeans(data: DataPoint[], count?: number, iterations?: number): DataCluster[];
