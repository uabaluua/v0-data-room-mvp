import { DataRoomView } from "@/components/data-room-view";

const Folder = async ({
  params,
}: {
  params: Promise<{ roomId: string; folderId: string }>;
}) => {
  const { roomId, folderId } = await params;

  return <DataRoomView roomId={roomId} folderId={folderId} />;
};

export default Folder;
