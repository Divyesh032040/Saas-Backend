### **SaaS Backend Overview**  
A **scalable, secure, and multi-tenant** backend with **role-based APIs** for Clients, Admins, and Superadmins. Built using **Node.js, Express/NestJS, MongoDB/PostgreSQL**, with **JWT authentication and RBAC**.  

---


### data modal
  ![Screenshot (50)](https://github.com/user-attachments/assets/96b73910-a4e8-4dac-905f-60841efb8f60)

### APIs

![Screenshot (51)](https://github.com/user-attachments/assets/7457f242-fcb2-461d-802f-55dc6c16e13a)

---

## **Role-Based APIs**  

### **1. Client APIs** (End-User)  
- **Auth**: `POST /auth/signup`, `POST /auth/login`, `POST /auth/forgot-password`  
- **Profile**: `GET /users/me`, `PUT /users/update-profile`  
- **Subscription**: `GET /plans`, `POST /subscribe`, `GET /billing-history`  

### **2. Admin APIs** (Manage Clients)  
- **Users**: `GET /users`, `PUT /users/:id`, `DELETE /users/:id`  
- **Analytics**: `GET /dashboard/stats`  
- **Support**: `POST /tickets/respond`  

### **3. Superadmin APIs** (System Control)  
- **Admins**: `POST /admins`, `DELETE /admins/:id`  
- **System Settings**: `GET /settings`, `PUT /settings`  
- **Billing**: `GET /subscriptions`, `POST /plans/create`



✅ **Includes Authentication, RBAC, Subscription, and Monitoring.** 🚀
