// import React, { useMemo, useState } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// import { useSearchUsers, type SearchUser } from "@/hooks/useUserSearch";
// import { useFriendRequests } from "@/hooks/useFriend";
// import UserSearchResultCard from "./UserSearchResultCard";

// type Props = {
//   visible: boolean;
//   onClose: () => void;
//   onMessage?: (user: SearchUser) => void;
// };

// export default function UserSearchModal({ visible, onClose, onMessage }: Props) {
//   const insets = useSafeAreaInsets();
//   const { height } = useWindowDimensions();
//   const [input, setInput] = useState("");

//   const { users, total, isSearching, hasQuery, isError } = useSearchUsers(input);
//   const { data: requests } = useFriendRequests();

//   // requestId -> createdAt (để hiện "15 phút trước")
//   const receivedTime = useMemo(() => {
//     const map = new Map<string, string>();
//     (requests?.received ?? []).forEach((r: any) =>
//       map.set(String(r._id), r.createdAt),
//     );
//     return map;
//   }, [requests]);

//   const byUsername = input.trim().startsWith("@");

//   const handleClose = () => {
//     setInput("");
//     onClose();
//   };

//   const Empty =
//     hasQuery && !isSearching ? (
//       <View style={styles.empty}>
//         <View style={styles.emptyIconWrap}>
//           <MaterialCommunityIcons
//             name="account-search-outline"
//             size={34}
//             color="#4F46E5"
//           />
//           <View style={styles.qBadge}>
//             <Text style={styles.qText}>?</Text>
//           </View>
//         </View>
//         <Text style={styles.emptyTitle}>Không tìm thấy người dùng phù hợp</Text>
//         <Text style={styles.emptyDesc}>
//           Hãy kiểm tra lại chính tả username bắt đầu bằng @ hoặc địa chỉ email cá
//           nhân.
//         </Text>
//         <View style={styles.emptyFooter}>
//           <Pressable onPress={() => setInput("@design_team")}>
//             <Text style={styles.emptyFooterText}>
//               Thử với: <Text style={styles.emptyFooterBold}>@design_team</Text>
//             </Text>
//           </Pressable>
//           <Pressable
//             onPress={() => {
//               /* TODO: mở màn quét QR */
//             }}
//           >
//             <Text style={styles.emptyFooterBold}>Quét mã QR cá nhân</Text>
//           </Pressable>
//         </View>
//       </View>
//     ) : null;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       onRequestClose={handleClose}
//     >
//       <Pressable
//         style={styles.backdrop}
//         onPress={handleClose}
//       />

//       <View
//         style={[
//           styles.panel,
//           { top: insets.top + 8, maxHeight: height - insets.top - 24 },
//         ]}
//       >
//         {/* Ô tìm kiếm */}
//         <View style={styles.searchBox}>
//           <Ionicons
//             name="search"
//             size={18}
//             color="#3B2FC9"
//           />
//           <TextInput
//             autoFocus
//             value={input}
//             onChangeText={setInput}
//             placeholder="Tìm bằng @username hoặc tên..."
//             placeholderTextColor="#9CA3AF"
//             autoCapitalize="none"
//             autoCorrect={false}
//             style={styles.input}
//           />
//           {isSearching && (
//             <ActivityIndicator
//               size="small"
//               color="#6366F1"
//             />
//           )}
//           <Pressable
//             onPress={input ? () => setInput("") : handleClose}
//             hitSlop={10}
//           >
//             <Ionicons
//               name="close"
//               size={20}
//               color="#6B7280"
//             />
//           </Pressable>
//         </View>

//         {hasQuery && (
//           <>
//             {/* Bộ lọc hiện tại */}
//             <View style={styles.filterRow}>
//               <Text style={styles.filterLabel}>Đang lọc theo:</Text>
//               <View style={styles.chip}>
//                 <Text style={styles.chipText}>
//                   {byUsername ? "Khớp username" : "Tên hoặc username"}
//                 </Text>
//                 <View style={styles.chipDot} />
//               </View>
//               <Text style={styles.count}>{total} kết quả tìm thấy</Text>
//             </View>

//             <View style={styles.resultHeader}>
//               <Text style={styles.resultTitle}>Kết quả tìm kiếm</Text>
//               <Pressable
//                 onPress={() => {
//                   /* TODO: bộ lọc nâng cao */
//                 }}
//               >
//                 <Text style={styles.advanced}>Bộ lọc nâng cao</Text>
//               </Pressable>
//             </View>
//           </>
//         )}

//         <FlatList
//           data={users}
//           keyExtractor={(u) => u._id}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           renderItem={({ item }) => (
//             <UserSearchResultCard
//               user={item}
//               receivedCreatedAt={
//                 item.requestId ? receivedTime.get(String(item.requestId)) : undefined
//               }
//               onMessage={(u) => {
//                 handleClose();
//                 onMessage?.(u);
//               }}
//             />
//           )}
//           ListEmptyComponent={
//             isError ? (
//               <Text style={styles.errorText}>
//                 Không thể tìm kiếm, vui lòng thử lại.
//               </Text>
//             ) : (
//               Empty
//             )
//           }
//           contentContainerStyle={{ paddingBottom: 8 }}
//         />
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(17,24,39,0.45)",
//   },
//   panel: {
//     position: "absolute",
//     left: 12,
//     right: 12,
//     backgroundColor: "#F8F8FC",
//     borderRadius: 20,
//     padding: 12,
//   },
//   searchBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     paddingHorizontal: 12,
//     height: 46,
//   },
//   input: { flex: 1, fontSize: 15, color: "#111827", paddingVertical: 0 },
//   filterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: 10,
//     paddingHorizontal: 2,
//   },
//   filterLabel: { fontSize: 11, color: "#6B7280" },
//   chip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: "#E0E0FB",
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//   },
//   chipText: { fontSize: 11, fontWeight: "600", color: "#3730A3" },
//   chipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#3730A3" },
//   count: { marginLeft: "auto", fontSize: 11, color: "#6B7280" },
//   resultHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 14,
//     marginBottom: 10,
//     paddingHorizontal: 2,
//   },
//   resultTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
//   advanced: { fontSize: 12, fontWeight: "600", color: "#3B2FC9" },

//   empty: {
//     alignItems: "center",
//     paddingVertical: 24,
//     paddingHorizontal: 12,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//   },
//   emptyIconWrap: {
//     width: 76,
//     height: 76,
//     borderRadius: 38,
//     backgroundColor: "#E0E0FB",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 14,
//   },
//   qBadge: {
//     position: "absolute",
//     top: -2,
//     right: -2,
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     backgroundColor: "#3B2FC9",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   qText: { color: "#fff", fontSize: 12, fontWeight: "700" },
//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1F2937",
//     textAlign: "center",
//   },
//   emptyDesc: {
//     fontSize: 12.5,
//     color: "#4B5563",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 18,
//   },
//   emptyFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignSelf: "stretch",
//     marginTop: 18,
//     paddingHorizontal: 6,
//   },
//   emptyFooterText: { fontSize: 11, color: "#4B5563" },
//   emptyFooterBold: { fontSize: 11, fontWeight: "600", color: "#1F2937" },
//   errorText: {
//     textAlign: "center",
//     color: "#DC2626",
//     fontSize: 13,
//     paddingVertical: 20,
//   },
// });
