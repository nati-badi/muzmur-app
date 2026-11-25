const {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy,
    limit,
    startAfter,
    runTransaction,
} = require('firebase/firestore');
const { db } = require('../config/firebase.config');
const DataService = require('./DataService');

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

    /**
     * User mezmur submissions (review queue)
     */
    static suggestNextMezmurId() {
        const all = DataService.getAll();
        let max = 0;
        all.forEach((h) => {
            const id = parseInt(String(h.id).replace(/^oro_/, ''), 10);
            if (!Number.isNaN(id) && id > max) {
                max = id;
            }
        });
        return String(max + 1);
    }

    static async getSubmissionsPaginated(statusFilter = null, lastDoc = null, pageSize = 20) {
        try {
            const submissionsRef = collection(db, 'mezmur_submissions');
            let q;
            const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
            if (statusFilter) {
                constraints.unshift(where('status', '==', statusFilter));
            }
            if (lastDoc) {
                constraints.splice(constraints.length - 1, 0, startAfter(lastDoc));
            }
            q = query(submissionsRef, ...constraints);

            const querySnapshot = await getDocs(q);
            const submissions = [];
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            querySnapshot.forEach((snap) => {
                submissions.push({ id: snap.id, ...snap.data() });
            });

            return { success: true, submissions, lastVisible };
        } catch (error) {
            console.error('Error fetching submissions:', error);
            return { success: false, error: error.message };
        }
    }

    static async getSubmissionById(submissionId) {
        try {
            const snap = await getDoc(doc(db, 'mezmur_submissions', submissionId));
            if (!snap.exists()) {
                return { success: false, error: 'Not found' };
            }
            return { success: true, submission: { id: snap.id, ...snap.data() } };
        } catch (error) {
            console.error('Error fetching submission:', error);
            return { success: false, error: error.message };
        }
    }

    static async approveSubmission(submissionId, adminUid, options = {}) {
        const { assignedMezmurId, duration = '0:00', preferCdn = false } = options;
        if (!assignedMezmurId) {
            return { success: false, error: 'Mezmur ID required' };
        }

        try {
            const submissionRef = doc(db, 'mezmur_submissions', submissionId);
            const mezmurRef = doc(db, 'mezmurs', String(assignedMezmurId));

            let mezmurPayload;
            await runTransaction(db, async (transaction) => {
                const submissionSnap = await transaction.get(submissionRef);
                if (!submissionSnap.exists()) {
                    throw new Error('Submission not found');
                }
                const submission = submissionSnap.data();
                if (submission.status !== 'pending') {
                    throw new Error('Submission is not pending');
                }

                const cdnUrl = `https://cdn.jsdelivr.net/gh/nati-badi/muzmur-assets@main/${assignedMezmurId}.m4a`;
                const audioUrl = preferCdn
                    ? cdnUrl
                    : (submission.audioDownloadUrl || cdnUrl);

                mezmurPayload = {
                    id: String(assignedMezmurId),
                    title: submission.title,
                    lyrics: submission.lyrics,
                    translation: submission.translation || '',
                    section: submission.section,
                    duration,
                    audioUrl,
                    sourceSubmissionId: submissionId,
                };

                transaction.set(
                    mezmurRef,
                    {
                        ...mezmurPayload,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );

                transaction.update(submissionRef, {
                    status: 'approved',
                    assignedMezmurId: String(assignedMezmurId),
                    reviewedBy: adminUid,
                    reviewedAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            });

            return { success: true, mezmur: mezmurPayload };
        } catch (error) {
            console.error('Error approving submission:', error);
            return { success: false, error: error.message };
        }
    }

    static async rejectSubmission(submissionId, adminUid, rejectionReason) {
        if (!rejectionReason?.trim()) {
            return { success: false, error: 'Rejection reason required' };
        }
        try {
            const submissionRef = doc(db, 'mezmur_submissions', submissionId);
            const snap = await getDoc(submissionRef);
            if (!snap.exists()) {
                return { success: false, error: 'Not found' };
            }
            if (snap.data().status !== 'pending') {
                return { success: false, error: 'Submission is not pending' };
            }
            await updateDoc(submissionRef, {
                status: 'rejected',
                rejectionReason: rejectionReason.trim(),
                reviewedBy: adminUid,
                reviewedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error) {
            console.error('Error rejecting submission:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = AdminService;
