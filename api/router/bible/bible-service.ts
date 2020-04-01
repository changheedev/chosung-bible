import { Sequelize, Op, WhereOptions } from '../../database/sequelize';
import Bible from '../../database/sequelize/models/Bible';
import Book from '../../database/sequelize/models/Book';

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
      return result;
    } catch (err) {
      throw err;
    }
  }

  async searchBibleByMeta(params: { book: number; chapter: number; verse: number; page: number }): Promise<Bible[]> {
    //사용자가 입력한 성경부터 10개의 데이터를 가져온다
    //사용자가 입력한 파라미터를 서브쿼리로 이용
    try {
      const result = await Bible.findAll({
        where: {
          id: {
            [Op.gte]: Sequelize.literal(
              `(select id from tbl_bible where book = ${params.book} and chapter = ${params.chapter} and verse = ${params.verse})`
            )
          }
        },
        offset: params.page * 10,
        limit: 10
      });

      return result;
    } catch (err) {
      throw err;
    }
  }

  async searchBibleByKeyword(params: { keyword: string; book: number; page: number }): Promise<Bible[]> {
    try {
      const [whereQuery, orderQuery] = this.makeKeywordQuery(params.keyword);

      let whereOptions: WhereOptions;

      if (params.book === 0) {
        whereOptions = Sequelize.literal(whereQuery);
      } else {
        whereOptions = {
          [Op.and]: [{ book: params.book }, Sequelize.literal(whereQuery)]
        };
      }

      const result = await Bible.findAll({
        where: whereOptions,
        order: [Sequelize.literal(orderQuery), ['book', 'ASC'], ['chapter', 'ASC'], ['verse', 'ASC']],
        offset: params.page * 10,
        limit: 10
      });

      return result;
    } catch (err) {
      throw err;
    }
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
