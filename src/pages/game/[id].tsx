import { type GetServerSideProps, type NextPage } from "next";

import Game from "~/components/Game";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  return {
    props: {
      gameId: id,
    },
  };
};

type Props = {
  gameId: string;
}
const GamePage: NextPage<Props> = ({ gameId }) => {
  return (
    <div>
      <Game gameId={gameId} />    
    </div>
  )
}

export default GamePage;
