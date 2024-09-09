import { useRouter } from "next/router";
import { type FC } from "react";

import { api } from "~/utils/api";

type Props = {
  btnLabel: string;
}
export const CreateGame: FC<Props> = ({ btnLabel }) => {
  const router = useRouter();
  const { mutateAsync: createGame, isPending } = api.game.create.useMutation();

  const handleCreateGame = async () => {
    const game = await createGame();
    void router.push(`/game/${game.id}`);
  };

  return (
    <button
      className="btn btn-primary"
      onClick={handleCreateGame}
      disabled={isPending}
    >
      {isPending && (
        <div className="loading loading-spinner" />
      )}
      {btnLabel}
    </button>
  )
};

export default CreateGame;

