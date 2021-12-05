//@ts-check
const { performance } = require('perf_hooks');

/**
 * 指定の処理を時間計測しながら行う
 * @param {() => any} callback 実行処理
 * @return {Promise<[any, number]>} [実行結果, 実行時間]
 */
async function execAsyncWithPerformance(callback) {
  const start = performance.now();
  return [await callback(), performance.now() - start];
}

exports.execAsyncWithPerformance = execAsyncWithPerformance;
