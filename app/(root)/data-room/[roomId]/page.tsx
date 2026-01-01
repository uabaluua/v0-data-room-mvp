import {DataRoomView} from '@/components/data-room-view';

const DataRoom = async ({params}: { params: Promise<{roomId: string}> }) => {
  const { roomId } = await params

  return (
    <DataRoomView roomId={roomId} />
  )
}

export default DataRoom

// export function DataRoomApp({
//                                 userId,
//                                 userEmail,
//                                 initialDataRoomId,
//                                 initialFolderId,
//                                 initialFileId,
//                             }: {
//     userId: string
//     userEmail: string
//     initialDataRoomId?: string
//     initialFolderId?: string
//     initialFileId?: string
// }) {
//     const { currentDataRoom, currentFolder, isLoading, selectDataRoom, selectFolder, dataRooms, folders } = useDataRoom()
//     const [activeTab, setActiveTab] = useState("my-rooms")
//     const [viewingFileId, setViewingFileId] = useState<string | null>(initialFileId || null)
//     const router = useRouter()
//     const searchParams = useSearchParams()
//     const pathname = usePathname()
//     const isNavigatingHome = useRef(false)
//
//     // Sync URL params with state
//     // useEffect(() => {
//     //   if (initialDataRoomId && dataRooms.length > 0) {
//     //     const dataRoom = dataRooms.find((dr) => dr.id === initialDataRoomId)
//     //     if (dataRoom && (!currentDataRoom || currentDataRoom.id !== initialDataRoomId)) {
//     //       selectDataRoom(dataRoom)
//     //     }
//     //   }
//     // }, [initialDataRoomId, dataRooms, currentDataRoom, selectDataRoom])
//
//     // useEffect(() => {
//     //   if (initialFolderId && folders.length > 0) {
//     //     const folder = folders.find((f) => f.id === initialFolderId)
//     //     if (folder) {
//     //       selectFolder(folder)
//     //     }
//     //   }
//     // }, [initialFolderId, folders, selectFolder])
//     //
//     // useEffect(() => {
//     //   if (initialFileId && initialFileId !== viewingFileId) {
//     //     setViewingFileId(initialFileId)
//     //   }
//     // }, [initialFileId, viewingFileId])
//
//     // Update URL when state changes (only if URL doesn't match)
//     // useEffect(() => {
//     //   // Skip URL sync if we're navigating home
//     //   if (isNavigatingHome.current) {
//     //     isNavigatingHome.current = false
//     //     return
//     //   }
//     //
//     //   if (currentDataRoom) {
//     //     const currentDataRoomParam = searchParams.get("dataRoom")
//     //     const currentFolderParam = searchParams.get("folder")
//     //     const currentFileParam = searchParams.get("file")
//     //
//     //     // Check if URL needs to be updated based on current state
//     //     const needsUpdate =
//     //       currentDataRoomParam !== currentDataRoom.id ||
//     //       (currentFolder && currentFolderParam !== currentFolder.id) ||
//     //       (!currentFolder && currentFolderParam) ||
//     //       (viewingFileId && currentFileParam !== viewingFileId) ||
//     //       (!viewingFileId && currentFileParam)
//     //
//     //     if (needsUpdate) {
//     //       const params = new URLSearchParams()
//     //       params.set("dataRoom", currentDataRoom.id)
//     //       // Only add folder if currentFolder exists
//     //       if (currentFolder) {
//     //         params.set("folder", currentFolder.id)
//     //       }
//     //       if (viewingFileId) {
//     //         params.set("file", viewingFileId)
//     //       }
//     //       router.replace(`/?${params.toString()}`, { scroll: false })
//     //     }
//     //   } else {
//     //     // Clear URL params when no data room is selected, but only if we're on /protected
//     //     if (pathname === "/") {
//     //       const currentParams = searchParams.toString()
//     //       if (currentParams) {
//     //         router.replace("/", { scroll: false })
//     //       }
//     //     }
//     //   }
//     // }, [currentDataRoom?.id, currentFolder?.id, viewingFileId, router, pathname, searchParams])
//
