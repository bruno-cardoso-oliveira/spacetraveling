import { GetStaticProps } from 'next';
import Link from "next/link";
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  console.log(postsPagination.results)

  return (
    <main className={commonStyles.container}>
      <Header />
      
      <div>
        {postsPagination?.results.map(post => (
          <Link href={`/post/${post.uid}`}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <ul>
                <li>{post.first_publication_date}</li>
                <li>{post.data.author}</li>
              </ul>
            </a>
          </Link>
         ))}
      </div>
    </main>
  );
}



export const getStaticProps: GetStaticProps = async () =>   {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { // coletando os posts pelo type de dentro do prismic
    pageSize: 3, // quantidade de posts exibidos por página
    orderings: { // ordena os posts do mais recente para o mais antigo
      field: 'last_publication_date',
      direction: 'desc',
    },
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  

  return {
    props: {
      postsPagination
    }
  }
};
