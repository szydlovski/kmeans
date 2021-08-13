export type DataCluster<DataType> = {
	mean: DataType;
	points: DataType[];
	totalError: number;
};

export function kMeans<T extends number[]>(data: T[], count = 10, iterations = 10): DataCluster<T>[] {
	if (data.length <= count) {
		return data.map((point) => ({
			mean: point,
			points: [point],
			totalError: 0,
		}));
	}
	const results: DataCluster<T>[][] = [];
	for (let i = 0; i < iterations; i++) {
		let means = pickRandomMeans(data, count);
		let clusters: DataCluster<T>[];
		let meansChanged = true;
		while (meansChanged) {
			clusters = clusterDataPoints(data, means);
			const newMeans = calculateNewMeans(clusters);
			meansChanged = haveMeansChanged(means, newMeans);
			means = newMeans;
		}
		results.push(clusters!);
	}
	return pickBestResult(results);
}

function pickBestResult<T>(results: DataCluster<T>[][]) {
	let bestResult: DataCluster<T>[];
	let bestError = Infinity;
	for (const result of results) {
		let totalError = 0;
		for (const cluster of result) {
			totalError += cluster.totalError;
		}
		if (totalError < bestError) {
			bestError = totalError;
			bestResult = result;
		}
	}
	return bestResult!;
}

function haveMeansChanged(previousMeans: number[][], newMeans: number[][]) {
	for (let mIdx = 0; mIdx < previousMeans.length; mIdx++) {
		for (let vIdx = 0; vIdx < previousMeans[mIdx].length; vIdx++) {
			if (previousMeans[mIdx][vIdx] !== newMeans[mIdx][vIdx]) {
				return true;
			}
		}
	}
	return false;
}

function calculateNewMeans<T extends number[]>(clusters: DataCluster<T>[]): T[] {
	const means: T[] = [];
	for (const { mean, points } of clusters) {
		if (points.length === 0) {
			means.push(mean);
		} else {
			const newMean = points
				.reduce(
					(totals, point) => totals.map((value, index) => value + point[index]),
					points[0].map(() => 0)
				)
				.map((value) => value / points.length);
			means.push(newMean as T);
		}
	}
	return means;
}

function isSameArray(arr1: any[], arr2: any[]) {
	if (arr1.length !== arr2.length) return false;
	for (const [index] of arr1.entries()) {
		if (arr1[index] !== arr2[index]) {
			return false;
		}
	}
	return true;
}

function pickRandomMeans<T extends number[]>(data: T[], count: number) {
	data = [...data];
	const means: T[] = [];
	while (means.length < count) {
		const index = Math.floor(Math.random() * data.length);
		const mean = data[index];
		if (means.some((existing) => isSameArray(existing, mean))) {
			continue;
		}
		data.splice(index, 1);
		means.push(mean);
	}
	return means;
}

function clusterDataPoints<T extends number[]>(
	data: T[],
	means: T[]
): DataCluster<T>[] {
  const clusters: DataCluster<T>[] = means.map((mean) => ({ mean, points: [], totalError: 0 }));
  for (const point of data) {
    let bestError = Infinity;
    let bestCluster = clusters[0];
    for (const cluster of clusters) {
      const clusterError = distanceBetweenPoints(point, cluster.mean);
      if (clusterError < bestError) {
        bestError = clusterError;
        bestCluster = cluster;
      }
    }
    bestCluster.points.push(point);
    bestCluster.totalError += bestError;
  }
  return clusters;
}

function zip<U, V>(array1: U[], array2: V[]): [U, V][] {
	const length = Math.min(array1.length, array2.length);
	const result: [U, V][] = [];
	for (let i = 0; i < length; i++) {
		result[i] = [array1[i], array2[i]];
	}
	return result;
}

function distanceBetweenPoints(p1: number[], p2: number[]) {
	return Math.pow(
		zip(p1, p2)
			.map(([coord1, coord2]) => Math.pow(coord2 - coord1, 2))
			.reduce((total, next) => total + next),
		0.5
	);
}
