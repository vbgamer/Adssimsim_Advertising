<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Adssimsim Advertising</title>

    <!-- ✅ Tailwind with integrity -->
    <script 
      src="https://cdn.tailwindcss.com" 
      integrity="sha384-5q4ySKxJ7F4h3sJ0Dxq5JmXg+S3L+SmvqMb1uzD0XjSCDkKeP2bCyo8cg0+4znx+" 
      crossorigin="anonymous">
    </script>

    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: {
                '400': '#4CAF50',
                '500': '#2E7D32',
                '600': '#1B5E20',
              },
              secondary: {
                '500': '#81C784',
              },
              accent: {
                '500': '#FFD700',
              },
              dark: '#0B0B0B',
              charcoal: '#1C1C1C',
              'off-white': '#F5F5F5',
            },
            boxShadow: {
              'glow-primary':
                '0 0 5px theme(colors.p
