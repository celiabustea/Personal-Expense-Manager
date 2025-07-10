// Performance monitoring utilities

export const measureComponentRender = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`⚡ ${componentName} render took: ${duration.toFixed(2)}ms`);
    
    // Color code based on performance
    if (duration > 100) {
      console.warn(`🔴 SLOW: ${componentName} took ${duration.toFixed(2)}ms`);
    } else if (duration > 50) {
      console.warn(`🟡 MEDIUM: ${componentName} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`🟢 FAST: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
};

export const measureAsync = async (operationName: string, operation: () => Promise<any>) => {
  const startTime = performance.now();
  try {
    const result = await operation();
    const endTime = performance.now();
    console.log(`⚡ ${operationName} took: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`❌ ${operationName} failed after: ${(endTime - startTime).toFixed(2)}ms`, error);
    throw error;
  }
};

export const logBundleSize = () => {
  if (typeof window !== 'undefined') {
    // Log loaded resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalSize = 0;
    const jsFiles = resources.filter(r => r.name.includes('.js'));
    const cssFiles = resources.filter(r => r.name.includes('.css'));
    
    console.log('📦 Bundle Analysis:');
    console.log(`- JS files loaded: ${jsFiles.length}`);
    console.log(`- CSS files loaded: ${cssFiles.length}`);
    
    jsFiles.forEach(file => {
      const size = file.transferSize || file.encodedBodySize || 0;
      totalSize += size;
      console.log(`  📄 ${file.name.split('/').pop()}: ${(size / 1024).toFixed(2)}KB`);
    });
    
    console.log(`📊 Total JS bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
  }
};

export const measureRouteChange = (from: string, to: string) => {
  const startTime = performance.now();
  console.log(`🔄 Route change: ${from} → ${to}`);
  
  return () => {
    const endTime = performance.now();
    console.log(`🔄 Route change completed in: ${(endTime - startTime).toFixed(2)}ms`);
  };
};
