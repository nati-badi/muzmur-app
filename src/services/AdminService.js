const {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy,
    limit,
    startAfter
} = require('firebase/firestore');
const { db } = require('../config/firebase.config');

class AdminService {
    /**
     * Sync mezmurs that have been updated since lastSync
     * Used for "Delta Sync" strategy to keep reads low
     */
    static async syncMezmurs(lastSyncTimestamp) {
        try {
            const mezmursRef = collection(db, 'mezmurs');
            const q = lastSyncTimestamp
                ? query(mezmursRef, where('updatedAt', '>', lastSyncTimestamp), orderBy('updatedAt', 'asc'))
                : query(mezmursRef, orderBy('updatedAt', 'asc'));

            const querySnapshot = await getDocs(q);
            const updates = [];
            querySnapshot.forEach((doc) => {
                updates.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, updates };
        } catch (error) {
            console.error('Error syncing mezmurs:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Paginated fetch of mezmurs for Admin management
     */
    static async getMezmursPaginated(lastDoc = null, pageSize = 20) {
        try {
            const mezmursRef = collection(db, 'mezmurs');
            let q;
            if (lastDoc) {
                q = query(mezmursRef, orderBy('title'), startAfter(lastDoc), limit(pageSize));
            } else {
                q = query(mezmursRef, orderBy('title'), limit(pageSize));
            }

            const querySnapshot = await getDocs(q);
            const mezmurs = [];
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            querySnapshot.forEach((doc) => {
                mezmurs.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, mezmurs, lastVisible };
        } catch (error) {
            console.error('Error fetching paginated mezmurs:', error);
            return { success: false, error: error.message };
        }
    }

    static async addMezmur(mezmurData) {
        try {
            const mezmursRef = collection(db, 'mezmurs');
            const docRef = await addDoc(mezmursRef, {
                ...mezmurData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding mezmur:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateMezmur(mezmurId, mezmurData) {
        try {
            const docRef = doc(db, 'mezmurs', mezmurId);
            await setDoc(docRef, {
                ...mezmurData,
                updatedAt: serverTimestamp()
            }, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error updating mezmur:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteMezmur(mezmurId) {
        try {
            const docRef = doc(db, 'mezmurs', mezmurId);
            await deleteDoc(docRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting mezmur:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * User Management
     */
    static async getUsersPaginated(lastDoc = null, pageSize = 20) {
        try {
            const usersRef = collection(db, 'users');
            let q;
            if (lastDoc) {
                q = query(usersRef, orderBy('email'), startAfter(lastDoc), limit(pageSize));
            } else {
                q = query(usersRef, orderBy('email'), limit(pageSize));
            }

            const querySnapshot = await getDocs(q);
            const users = [];
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, users, lastVisible };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateUserRole(userId, role) {
        try {
            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, { role });
            return { success: true };
        } catch (error) {
            console.error('Error updating user role:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteUser(userId) {
        try {
            const docRef = doc(db, 'users', userId);
            await deleteDoc(docRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Feedback System
     */
    static async submitFeedback(userId, feedbackData) {
        try {
            const feedbackRef = collection(db, 'feedback');
            await addDoc(feedbackRef, {
                userId,
                ...feedbackData,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error submitting feedback:', error);
            return { success: false, error: error.message };
        }
    }

    static async getFeedback(lastDoc = null, pageSize = 20) {
        try {
            const feedbackRef = collection(db, 'feedback');
            let q;
            if (lastDoc) {
                q = query(feedbackRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
            } else {
                q = query(feedbackRef, orderBy('createdAt', 'desc'), limit(pageSize));
            }

            const querySnapshot = await getDocs(q);
            const feedback = [];
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            querySnapshot.forEach((doc) => {
                feedback.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, feedback, lastVisible };
        } catch (error) {
            console.error('Error fetching feedback:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = AdminService;
