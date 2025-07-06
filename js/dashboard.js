// Xử lý sự kiện nhấp vào các mục menu
document.addEventListener('DOMContentLoaded', function() {
  const menuLinks = document.querySelectorAll('.menu .nav-link');
  menuLinks.forEach(link => {
      link.addEventListener('click', function() {
          // Xóa class active khỏi tất cả các mục
          menuLinks.forEach(l => l.classList.remove('active'));
          // Thêm class active cho mục được nhấp
          this.classList.add('active');
          // TODO: Tải nội dung tương ứng vào khu vực content
      });
  });
});