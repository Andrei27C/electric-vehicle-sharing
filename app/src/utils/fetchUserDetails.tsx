// import axios from 'axios';
// import { API_URL } from '../config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// export async function fetchUserDetails(userId: any) {
//   try {
//     const token = await AsyncStorage.getItem('token');
//     const response = await axios.get(`${API_URL}/user/${userId}`, {
//       headers: { Authorization: `Bearer ${token}` }, params: { userId }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Failed to fetch user details:', error);
//     throw error; // You can also handle the error here and decide what to return in case of an error
//   }
//   //
//   // const fetchUserPoints = async () => {
//   //   try {
//   //     const token = await AsyncStorage.getItem('token');
//   //     const userId = await AsyncStorage.getItem('userId');
//   //     console.log('Fetching user points:', userId);
//   //     const response = await axios.get(`${API_URL}/get-user-points/${userId}`, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });
//   //     console.log('Fetched user points:', response.data.points);
//   //     setUserPoints(response.data.points);
//   //   } catch (error) {
//   //     console.error('Failed to fetch user points:', error);
//   //   }
//   // };
// }
