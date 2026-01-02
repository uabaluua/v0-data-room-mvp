import { DataRoomView } from "@/components/data-room-view";

const DataRoom = async ({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) => {
  const { roomId } = await params;

  return <DataRoomView roomId={roomId} folderId={null} />;
};

export default DataRoom;
