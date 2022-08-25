import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if(router.isFallback) { // se o post ainda não foi carregado, vai exibir um carregando em tela...
    return <h1>Carregando...</h1>
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    const headingTime = contentItem.heading.split(/\s+/).length;
    const wordsTime = RichText.asText(contentItem.body).split(/\s+/).length;

    return total + headingTime + wordsTime;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const formattedDate = format(
    new Date(post.first_publication_date), 
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  )
  
  return (
    <>
      <Header />
      <img src={post.data.banner.url} alt="Banner" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
            <ul>
              <li>
                <FiCalendar />
                {formattedDate}
              </li>
              <li>
                <FiUser />
                {post.data.author}
              </li>
              <li>
                <FiClock />
                {`${readTime} min`}
              </li>
            </ul>
          </div>

          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div 
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body)
                  }}    
                />
              </article>
            )
          })}
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths,
    fallback: true,
  }

 };

export const getStaticProps: GetStaticProps = async ({params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  return {
    props: {
      post: response,
    },
    revalidate: 1800 // 30 minutos -> como se trata do getStaticProps e ele é estático, a cada intervalo definido o next irá verificar se o post teve alguma alteração
  }
};
