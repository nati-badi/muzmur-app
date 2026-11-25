# Firebase rules (Firestore + Storage)

Deploy from this directory after installing the [Firebase CLI](https://firebase.google.com/docs/cli) and logging in:

```bash
cd firebase
firebase use muzmur-app-v2-20d15
firebase deploy --only firestore:rules,firestore:indexes,storage
```

**Important:** User mezmur submissions and admin review depend on these rules. Without deploying them, client writes may fail or remain unsecured if older permissive rules exist in the console.

Admin access is determined by `users/{uid}.role == 'admin'` in Firestore.