import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/sign-in/sign-in').then((m) => m.Login),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.Register),
  },

  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  { path: 'terms', loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms) },
  { path: 'about', loadComponent: () => import('./pages/about/about').then((m) => m.About) },
  {
    path: 'track-order',
    loadComponent: () => import('./pages/track-order/track-order').then((m) => m.TrackOrder),
  },
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent) },
  { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent) },
  {
    path: 'products',
    title: 'Solera | Formulations Catalog Index',
    loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductListComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist').then(m => m.WishlistComponent),
  },
  {
    path: 'product-detail/:id',
    title: 'Solera | Product Details Configuration',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent)
  },
  {
  path: 'cart',
  loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent),
  canActivate: [authGuard]   // aapka existing guard, guards folder se import karein
},
{
  path: 'checkout',
  loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutComponent),
  canActivate: [authGuard]
},
{
  path: 'order-success',
  loadComponent: () => import('./pages/order-success/order-success').then(m => m.OrderSuccessComponent),
  canActivate: [authGuard]
},
{
  path: 'profile',
  loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
  canActivate: [authGuard]
},
{
  path: 'profile/orders',
  loadComponent: () => import('./pages/my-orders/my-orders').then(m => m.MyOrdersComponent),
  canActivate: [authGuard]
},
{
  path: 'order-detail/:id',
  loadComponent: () => import('./pages/order-detail/order-detail').then(m => m.OrderDetailComponent),
  canActivate: [authGuard]
},
// Admin routes — existing routes ke saath
{
  path: 'admin',
  canActivate: [adminGuard],
  loadComponent: () =>
    import('./pages/admin/admin-layout/admin-layout')
      .then(m => m.AdminLayoutComponent),
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./pages/admin/dashboard/admin-dashboard/admin-dashboard')
          .then(m => m.AdminDashboardComponent)
    },
    {
      path: 'products',
      loadComponent: () =>
        import('./pages/admin/products/admin-products/admin-products')
          .then(m => m.AdminProductsComponent)
    },
    {
      path: 'orders',
      loadComponent: () =>
        import('./pages/admin/orders/admin-orders/admin-orders')
          .then(m => m.AdminOrdersComponent)
    },
    {
      path: 'users',
      loadComponent: () =>
        import('./pages/admin/users/admin-users/admin-users')
          .then(m => m.AdminUsersComponent)
    },
    {
      path: 'categories',
      loadComponent: () =>
        import('./pages/admin/categories/admin-categories/admin-categories')
          .then(m => m.AdminCategoriesComponent)
    },
    {
      path: 'banners',
      loadComponent: () =>
        import('./pages/admin/banners/admin-banners/admin-banners')
          .then(m => m.AdminBannersComponent)
    },
    {
      path: 'notifications',
      loadComponent: () =>
        import('./pages/admin/notifications/admin-notifications/admin-notifications')
          .then(m => m.AdminNotificationsComponent)
    },
    {
      path: 'reviews',
      loadComponent: () =>
        import('./pages/admin/reviews/admin-reviews/admin-reviews')
          .then(m => m.AdminReviewsComponent)
    },
    {
      path: 'settings',
      loadComponent: () =>
        import('./pages/admin/settings/admin-settings')
          .then(m => m.AdminSettings)
    },
    {
      path: 'testimonials',
      loadComponent: () =>
        import('./pages/admin/testimonials/admin-testimonials/admin-testimonials')
          .then(m => m.AdminTestimonialsComponent)
    },
    {
      path: 'why-choose-us',
      loadComponent: () =>
        import('./pages/admin/why-choose-us/admin-why-choose-us/admin-why-choose-us')
          .then(m => m.AdminWhyChooseUsComponent)
    },
    {
      path: 'contact-us',
      loadComponent: () =>
        import('./pages/admin/admin-contact-us/admin-contact-us/admin-contact-us').then(m => m.AdminContactUsComponent)
    }
  ]
},
];