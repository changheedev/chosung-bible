import { Request } from 'express';
import { Sequelize, Op, WhereOptions } from '../../database/sequelize';
import Bible from '../../database/sequelize/models/Bible';
import Book from '../../database/sequelize/models/Book';
import cache from '../../util/cache';
import logQueue from '../../util/searchlog-queue';

interface BibleMetadata {
  book: number;
  chapters: number;
  verses: Array<number>;
}

interface ChapterMetadata {
  book: number;
  chapters: number;
}

interface VerseMetadata {
  book: number;
  chapter: number;
  verses: number;
}

class BibleService {
  constructor() {}

  private intergrateMetadata(chapterMeta: ChapterMetadata[], verseMeta: VerseMetadata[]): BibleMetadata[] {
    let bibleMeta: BibleMetadata[] = [];

    for (let i = 1; i <= 66; i++) {
      let count = 0;
      const versesOfCurrent: number[] = verseMeta.reduce((prev: number[], curVerseMeta: VerseMetadata) => {
        if (curVerseMeta.book === i) {
          prev.push(curVerseMeta.verses);
          count++;
        }
        return prev;
      }, []);

      const curBibleMeta = {
        book: chapterMeta[i - 1].book,
        chapters: chapterMeta[i - 1].chapters,
        verses: versesOfCurrent
      };

      bibleMeta.push(curBibleMeta);
      verseMeta.splice(0, count);
    }

    return bibleMeta;
  }

  async getBibleMeta() {
    try {
      const key = 'metadata';
      const dataFromCache = await cache.getAsync(key);
      if (dataFromCache) {
        return dataFromCache;
      }

      const [bookList, resultChapter, resultVerse] = await Promise.all([
        Book.findAll(),
        Bible.sequelize?.query('select book, max(chapter) as chapters from tbl_bible group by book'),
        Bible.sequelize?.query('select book, chapter, count(verse) as verses from tbl_bible group by book, chapter')
      ]);

      if (!resultChapter || !resultVerse) throw new Error('메타데이터를 불러올 수 없습니다');

      const chapterMeta: ChapterMetadata[] = resultChapter[0] as ChapterMetadata[];
      const verseMeta: VerseMetadata[] = resultVerse[0] as VerseMetadata[];

      const bibleMeta = this.intergrateMetadata(chapterMeta, verseMeta);

      const result = { books: bookList, metadata: bibleMeta };
      await cache.setAsync(key, result);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async searchBibleByMeta(req: Request): Promise<Bible[]> {
    const book = Number(req.params.book);
    const chapter = Number(req.params.chapter);
    const verse = Number(req.params.verse);
    const page = Number(req.query.page || 0);

    if (this.hasNaN([book, chapter, verse, page])) throw new Error('Params must be number');

    //사용자가 입력한 성경부터 10개의 데이터를 가져온다
    //사용자가 입력한 파라미터를 서브쿼리로 이용
    try {
      const key = req.url;
      const dataFromCache = await cache.getAsync(key);
      if (dataFromCache) {
        await logQueue.insertLog(req.useragent, { book: book, chapter: chapter, verse: verse, page: page }, 'cache');
        return dataFromCache;
      }

      const result = await Bible.findAll({
        where: {
          id: {
            [Op.gte]: Sequelize.literal(
              `(select id from tbl_bible where book = ${book} and chapter = ${chapter} and verse = ${verse})`
            )
          }
        },
        offset: page * 10,
        limit: 10
      });

      await cache.setAsync(key, result);
      await logQueue.insertLog(req.useragent, { book: book, chapter: chapter, verse: verse, page: page }, 'db');
      return result;
    } catch (err) {
      throw err;
    }
  }

  async searchBibleByKeyword(req: Request): Promise<Bible[]> {
    const keyword = decodeURIComponent(req.query.keyword);
    const book = Number(req.query.book);
    const page = Number(req.query.page || 0);

    if (this.hasNaN([page])) throw new Error('Page is must be number');

    try {
      const key = `?keyword=${keyword}&book=${book}&page=${page}`;

      const dataFromCache = await cache.getAsync(key);
      if (dataFromCache) {
        await logQueue.insertLog(req.useragent, { keyword: keyword, book: book, page: page }, 'cache');
        return dataFromCache;
      }

      const [whereQuery, orderQuery] = this.makeKeywordQuery(keyword);

      let whereOptions: WhereOptions;

      if (book === 0) {
        whereOptions = Sequelize.literal(whereQuery);
      } else {
        whereOptions = {
          [Op.and]: [{ book: book }, Sequelize.literal(whereQuery)]
        };
      }

      const result = await Bible.findAll({
        where: whereOptions,
        order: [Sequelize.literal(orderQuery), ['book', 'ASC'], ['chapter', 'ASC'], ['verse', 'ASC']],
        offset: page * 10,
        limit: 10
      });

      await cache.setAsync(key, result);
      await logQueue.insertLog(req.useragent, { keyword: keyword, book: book, page: page }, 'db');
      return result;
    } catch (err) {
      throw err;
    }
  }

  private hasNaN(params: number[]) {
    for (const item of params) {
      if (Number.isNaN(item)) return true;
    }
    return false;
  }

  private makeKeywordQuery(keyword: string): [string, string] {
    const keywordTokens = keyword.split(' ');
    const keywordTokensLenTwoOrGreater = keywordTokens.filter(token => token.length >= 2);

    const whereQuery = `MATCH (content) AGAINST ('${keyword}' in boolean mode)`;

    //1.키워드(문장)과 정확하게 일치
    let orderQuery = `MATCH (content) AGAINST ('"${keyword}"' in boolean mode) DESC`;

    //2.키워드 토큰(단어)를 모두 포함
    orderQuery += `, MATCH (content) AGAINST ('${keywordTokens
      .map(token => `+${token}`)
      .join(' ')}' in boolean mode) DESC`;

    if (keywordTokensLenTwoOrGreater) {
      //3.길이가 2 이상인 단어만 모두 포함
      orderQuery += `, MATCH (content) AGAINST ('${keywordTokensLenTwoOrGreater
        .map(token => `+${token}`)
        .join(' ')}' in boolean mode) DESC`;

      //4.길이가 2 이상인 단어 중 하나라도 포함
      orderQuery += `, MATCH (content) AGAINST ('${keywordTokensLenTwoOrGreater
        .map(token => `${token}`)
        .join(' ')}' in boolean mode) DESC`;
    }

    return [whereQuery, orderQuery];
  }
}

export default new BibleService();
