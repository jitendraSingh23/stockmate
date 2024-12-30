
# **StockMate**

A **invetory managment** web with chart visualization and all track of transactions, quantity, brand, category etc. 

### [Vercel Demo](https://stockmate-jitendrasingh23s-projects.vercel.app/auth/signin) ###


## Screenshots

![stackmate](https://github.com/user-attachments/assets/3989ca45-4bb4-4ffa-b428-489da0a9b4e8)

![Screenshot 2024-12-30 001944](https://github.com/user-attachments/assets/94b35809-454b-4377-846c-bd74f048c191)

## Features

- Signin/Signup
- Create product
- Product brand, category, quantity, instock tracking with **chart**
- Transaction tracking with **chart** visualization
- Clean data visualization with **filter** options in every feild
- Track of data for every **year**, **month** and **day**
- **Dropdown filter** for every type of data (Transaction, Product)
- Compatible with both **Themes**(light and dark)
- Cross platform


## Tech Stack

**NEXTjs, Typescript, Postgres, TailwindCSS, Prisma, Docker**


## Lessons Learned
- Hands on several new libraries like **Chartjs, Ag-Grid**
- Better fecthing and data filters
- NEXTjs frontend and backend handling
- Authentication using NEXTAUTH
- Typescript type security handling
- Tailwind CSS practice
- Prisma models and schema handle
- Dockerization of applications

## Run Locally

1. Clone the project

```bash
git clone https://github.com/jitendraSingh23/stockmate.git
```

2. Go to the project directory

```bash
cd stockmate
```
3. create .env

```bash
DATABASE_URL="postgresql://postgres:password@db:5432/mydb?schema=sample"
NEXTAUTH_SECRET= your_secret
JWT_SECRET= your_secret
```
4. Build the Docker image

```bash
docker-compose build
```

5. Start the Docker containers

```bash
docker-compose up
```

6. Try to access app on your [localhost:3000](http://localhost:3000/).
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL` 
`NEXTAUTH_SECRET`
`JWT_SECRET`



## Feedback

If you have any feedback, please reach out to us at work.jitendrasingh@gmail.com

