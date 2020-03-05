import { Sequelize, Op } from 'sequelize';
import database from '../../database/sequelize';
import Bible from '../../database/sequelize/models/bible';
import Book from '../../database/sequelize/models/book';

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
  private static instance: BibleService;

  constructor() {
    if (!BibleService.instance) {
      BibleService.instance = this;
    }
    return BibleService.instance;
  }

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
        database.query('select book, max(chapter) as chapters from tbl_bible group by book'),
        database.query('select book, chapter, count(verse) as verses from tbl_bible group by book, chapter')
      ]);

      const chapterMeta: ChapterMetadata[] = resultChapter[0] as ChapterMetadata[];
      const verseMeta: VerseMetadata[] = resultVerse[0] as VerseMetadata[];

      const bibleMeta = this.intergrateMetadata(chapterMeta, verseMeta);
      return { books: bookList, metadata: bibleMeta };
    } catch (err) {
      throw new Error(err);
    }
  }

  private hasNaN(params: number[]) {
    for (const item of params) {
      if (Number.isNaN(item)) return true;
    }
    return false;
  }

  async searchBibleByMeta(book: number, chapter: number, verse: number, page: number) {
    if (this.hasNaN([book, chapter, verse, page])) throw new Error('Params must be number');

    //사용자가 입력한 성경부터 10개의 데이터를 가져온다
    //사용자가 입력한 파라미터를 서브쿼리로 이용
    try {
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
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async searchBibleByKeyword(keyword: string, page: number) {
    if (this.hasNaN([page])) throw new Error('Page is must be number');

    try {
      const keywordTokens = keyword.split(' ');
      const result = await Bible.findAll({
        where: Sequelize.literal(`MATCH (content) AGAINST ('${keywordTokens.join(' ')}' in boolean mode)`),
        order: [
          Sequelize.literal(`MATCH (content) AGAINST ('"${keyword}"' in boolean mode) DESC`),
          Sequelize.literal(
            `MATCH (content) AGAINST ('${keywordTokens.map(token => `+${token}`).join(' ')}' in boolean mode) DESC`
          ),
          ['book', 'ASC'],
          ['chapter', 'ASC'],
          ['verse', 'ASC']
        ],
        offset: page * 10,
        limit: 10
      });
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }
}

const instance = new BibleService();
export default instance;
