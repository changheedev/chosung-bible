'use strict';

class SearchHistory {
  constructor() {
    if (!SearchHistory.istance) {
      SearchHistory.instance = this;
    }
    return SearchHistory.instance;
  }

  getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory'));
  }
  getOrDefaultSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory')) || new Array();
  }
  findIndexByMeta(from, meta) {
    return from.findIndex(
      item => item.data.book === meta.book && item.data.chapter === meta.chapter && item.data.verse === meta.verse
    );
  }
  findIndexByKeyword(from, text) {
    return from.findIndex(item => item.data.text === text);
  }
  removeDuplHistory(histories, newHistory) {
    let index = 0;
    if (newHistory.type === 'keyword') {
      index = this.findIndexByKeyword(histories, newHistory.data.text);
    } else {
      index = this.findIndexByMeta(histories, newHistory.data);
    }

    //중복된 기록 삭제
    if (index !== -1) {
      histories.splice(index, 1);
    }
  }
  updateLocalStorage(histories) {
    //히스토리는 10개 까지만 저장
    if (histories.length > 10) {
      histories.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(histories));
  }
  saveSearchHistory(newHistory) {
    const histories = this.getOrDefaultSearchHistory();
    this.removeDuplHistory(histories, newHistory);
    histories.unshift(newHistory);
    this.updateLocalStorage(histories);
  }
  //이전 버전의 포맷으로 저장된 히스토리들을 업데이트 된 포맷으로 변경
  updatePrevVersionHistories() {
    const histories = this.getSearchHistory();
    if (histories) {
      const newHistories = histories.reduce((ret, history) => {
        if (!history.type) {
          ret.push({
            type: 'meta',
            data: history
          });
        } else if (history.type === 'keyword' && !history.data.text) {
          ret.push({
            type: 'keyword',
            data: {
              text: history.data.keyword,
              book: null,
              keyword: history.data.keyword
            }
          });
        } else {
          ret.push(history);
        }

        return ret;
      }, []);
      this.updateLocalStorage(newHistories);
    }
  }
  clearSearchHistory() {
    localStorage.removeItem('searchHistory');
  }
}

const searchHistory = new SearchHistory();

export default searchHistory;
