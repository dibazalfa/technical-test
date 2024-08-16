## API Documentation

Berikut merupakan dokumentasi API dari penugasan "Technical Test BE" yang telah diberikan

Aplikasi manajemen tugas (task management application) untuk tim-tim proyek. Aplikasi ini bertujuan untuk membantu anggota tim mengatur dan memantau tugas-tugas mereka dengan lebih efisien

oleh : Adiba Zalfa Camilla

## REST Client

Dokumentasi API dapat diakses menggunakan REST Client, extension yang terdapat pada Visual Studio Code

Saya membagi dokumentasi API menjadi tiga file yang sudah di upload pada repositori ini, dengan path berikut:

```
documentationApi/users.http
documentationApi/projects.http
documentationApi/tasks.http
```

## How to Use REST Client

REST Client digunakan sebagai dokumentasi API

1. Lakukan clone repositori ` git clone https://github.com/dibazalfa/technical-test.git` 
2. Jalankan command `npm install` kemudian `npm run start` pada repositori
3. Install REST Client pada Extension VSCODE

![Install REST Client](https://github.com/user-attachments/assets/9ca72948-0751-4bd9-85db-f2cd7727e6a3)

4. Buka file `users.http`
5. Untuk melakukan testing API, tekan tulisan `Send Request` yang ada di atas setiap endpoint

![Send Request](https://github.com/user-attachments/assets/11894676-4f7d-458e-b099-8618c140fc65)

6. Pastikan untuk register akun terlebih dahulu pada `users.http`, kemudian login
7. Seluruh API hanya dapat diakses ketika user sudah login. Setelah melakukan login pastikan untuk mengubah isi dari `@token` pada baris pertama menjadi token yang didapatkan dari response endpoint /auth/login

![Login](https://github.com/user-attachments/assets/6f0e61d4-14f1-42ec-91c8-8b9de6044189) ![Update Token](https://github.com/user-attachments/assets/c223c549-1060-4075-a46f-9eebcdae4cf6)

8. Setelah melakukan login dan mengubah token, seluruh API dapat diakses
9. Ketika ingin mengakses API pada API projects dan tasks, silakan pindah ke file `projects.http` atau `tasks.http`
10. Untuk setiap file nya, jangan lupa untuk melakukan login dan mengubah `@token` di barisan pertama

## List of Endpoint
Detail terkait endpoint serta request nya dapat dilihat pada file `.http` pada folder `documentationAPI`, untuk detail response dapat menggunakan REST Client seperti yang sudah dijelaskan di atas

**Users API**
```
POST /auth/register
POST /auth/login
GET /users
PUT /users
DELETE /users
```

**Projects API**
```
POST /projects
GET /projects/users
GET /projects/all
GET /projects/:id
GET /projects/:id/tasks
PUT /projects/:id
DELETE /projects/:id
```

**Tasks API**
```
POST /tasks
GET /tasks/users
GET /tasks/all
GET /tasks/:id
PUT /tasks/:id
DELETE /tasks/:id
```
