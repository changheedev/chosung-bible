'use strict';

class SearchHistory {
  getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory'));
  }
  getOrDefaultSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory')) || new Array();
  }
  findIndex(from, newHistory) {
    if (from.length === 0) return -1;
    return from.findIndex(item => {
      if (item.type !== newHistory.type) return false;
      const keys = Object.keys(item.data);
      return keys.every(
        key =>
          key === 'text' ||
          (item.data.hasOwnProperty(key) &&
            newHistory.data.hasOwnProperty(key) &&
            item.data[key] === newHistory.data[key])
      );
    });
  }
  updateLocalStorage(histories) {
    //히스토리는 10개 까지만 저장
    if (histories.length > 10) {
      histories.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(histories));
  }
  saveSearchHistory(newHistory) {
    if (Object.keys(newHistory).length === 0) return;
    const histories = this.getOrDefaultSearchHistory();
    const index = this.findIndex(histories, newHistory);
    //중복된 기록 삭제
    if (index !== -1) {
      histories.splice(index, 1);
    }
    histories.unshift(newHistory);
    this.updateLocalStorage(histories);
  }
  //히스토리 타입이 변경된 경우 기존 히스토리를 초기화
  clearPrevVersionHistories() {
    //히스토리 타입의 변경이 일어난 최종 버전
    const currentVersion = '1.4.4';
    //기존에 저장된 히스토리 버전
    const oldVersion = localStorage.getItem('version');
    if (oldVersion && oldVersion === currentVersion) return;

    this.clearSearchHistory();
    localStorage.setItem('version', currentVersion);
  }
  clearSearchHistory() {
    localStorage.removeItem('searchHistory');
  }
}

export default new SearchHistory();
