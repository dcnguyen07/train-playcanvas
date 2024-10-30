import { defineConfig } from 'vite';
import del from 'rollup-plugin-delete'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        del({ targets: 'dist/*', ignore: ['dist/assets'], runOnce: true}),
        del({ targets: 'dist/*', ignore: ['dist/assets', 'dist/index*'], runOnce: true, hook: 'buildEnd'}),
    ],
    server: {
        port: 8080,
    },
    build: {
        outDir: 'dist',
        assetsDir: '',
        minify: true,
        emptyOutDir: false,
        copyPublicDir: false,
        chunkSizeWarningLimit: 2 * 1024, // 2MB
    },
    publicDir: 'dist',
});
