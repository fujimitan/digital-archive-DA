const chokidar = require('chokidar');
const sass = require('sass');
const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const inputDir = path.resolve('./bundles/web/scss');
const outputDir = path.resolve('./bundles/web/css');

// 出力先を作成（なければ）
fs.mkdirSync(outputDir, { recursive: true });

// ✅ ビルド対象（_除外）
const buildTargets = fg.sync([`${inputDir}/**/*.scss`, `!**/_*.scss`], { absolute: true });

// ✅ 監視対象（_含むすべて）
const watchTargets = fg.sync(`${inputDir}/**/*.scss`, { absolute: true });

function compileAll() {
  console.log(`\n🔄 全ビルド開始 (${new Date().toLocaleTimeString()})`);
  buildTargets.forEach(file => {
    const fileName = path.basename(file);
    const outPath = path.join(outputDir, fileName.replace(/\.scss$/, '.css'));
    const mapPath = `${outPath}.map`;

    try {
      const result = sass.renderSync({
        file,
        outFile: outPath,
        sourceMap: true,
        sourceMapContents: true,
      });

      fs.writeFileSync(outPath, result.css);
      fs.writeFileSync(mapPath, result.map);
      console.log(`✅ ${fileName}`);
    } catch (e) {
      console.error(`❌ ${fileName} → ${e.message}`);
    }
  });
}

// 初回ビルド
compileAll();

// chokidarで監視
chokidar.watch(watchTargets, {
  persistent: true,
  usePolling: false
}).on('change', (changed) => {
  console.log(`📦 変更検知: ${path.basename(changed)}`);
  compileAll(); // 依存関係があるので全再ビルド
});
