# 🎨 Figma-to-Next.js Code Extractor - Implementation Tasks

## 📊 Project Status Overview

| Phase | Status | Progress | Priority |
|-------|--------|----------|----------|
| Phase 1: Setup & API | ⚪ Not Started | 0/6 | 🔴 Critical |
| Phase 2: Translation Engine | ⚪ Not Started | 0/8 | 🔴 Critical |
| Phase 3: Style Mapping | ⚪ Not Started | 0/7 | 🔴 Critical |
| Phase 4: Asset Management | ⚪ Not Started | 0/5 | 🟠 High |
| Phase 5: UI & Client Features | ⚪ Not Started | 0/9 | 🟢 Medium |
| Phase 6: Testing & Polish | ⚪ Not Started | 0/6 | 🟡 Low |

**Legend**: ⚪ Not Started | 🔵 In Progress | ✅ Completed | ⚠️ Blocked

---

## 🎯 Phase 1: Setup & API Connection

**Goal**: Establish connection with Figma API and retrieve design data

### Task 1.1: Install Dependencies
- [ ] Install `axios` for HTTP requests
- [ ] Install `zod` for input validation
- [ ] Verify TypeScript configuration
- [ ] Update `package.json` with new dependencies

```bash
npm install axios zod
npm install --save-dev @types/node
```

**Estimated Time**: 15 minutes  
**Files**: `package.json`

---

### Task 1.2: Create Type Definitions
- [ ] Create `src/lib/figma/types.ts`
- [ ] Define `FigmaNode` interface
- [ ] Define `FigmaFile` response type
- [ ] Define `JSXElement` interface
- [ ] Define `AssetUrl` interface
- [ ] Define `ExtractResult` interface
- [ ] Define error types

**Estimated Time**: 45 minutes  
**Files**: `src/lib/figma/types.ts`

**Reference**: See FIGMA_TOOL_DESIGN.md section "Complete Type Definitions"

---

### Task 1.3: Create Figma API Client
- [ ] Create `src/lib/figma/client.ts`
- [ ] Implement `FigmaClient` class with axios
- [ ] Add `parseFileKey()` method to extract file key from URL
- [ ] Add `getFile()` method to fetch file data
- [ ] Add `getImageUrls()` method for asset URLs
- [ ] Implement error handling with try-catch
- [ ] Add request timeout configuration (30s)

**Estimated Time**: 1.5 hours  
**Files**: `src/lib/figma/client.ts`

**Acceptance Criteria**:
```typescript
const client = new FigmaClient('figd_token');
const fileKey = client.parseFileKey(url);
const fileData = await client.getFile(fileKey);
const assets = await client.getImageUrls(fileKey, nodeIds);
```

---

### Task 1.4: Create API Route
- [ ] Create `src/app/api/figma-extract/route.ts`
- [ ] Implement POST handler
- [ ] Add Zod validation for request body
- [ ] Initialize FigmaClient with PAT
- [ ] Fetch file data from Figma API
- [ ] Return structured JSON response
- [ ] Implement comprehensive error handling

**Estimated Time**: 1 hour  
**Files**: `src/app/api/figma-extract/route.ts`

---

### Task 1.5: Create Constants File
- [ ] Create `src/lib/figma/constants.ts`
- [ ] Define spacing scale mapping (4px = gap-1, etc.)
- [ ] Define font weight mapping (100-900)
- [ ] Define text alignment mapping
- [ ] Define color mapping utilities
- [ ] Add Figma API base URL

**Estimated Time**: 30 minutes  
**Files**: `src/lib/figma/constants.ts`

---

### Task 1.6: Test API Connection
- [ ] Test valid Figma URL + PAT
- [ ] Test invalid PAT error handling
- [ ] Test invalid URL format
- [ ] Test rate limiting scenario
- [ ] Test file not found error
- [ ] Verify response structure matches types

**Estimated Time**: 45 minutes  
**Tools**: Postman/Thunder Client

---

## 🔄 Phase 2: Translation Engine Core

**Goal**: Build the recursive node traversal and basic JSX structure generation

### Task 2.1: Create Translation Engine Base
- [ ] Create `src/lib/figma/translator.ts`
- [ ] Implement `TranslationEngine` class
- [ ] Add `translate()` main method
- [ ] Add configuration options (indent size, component naming)
- [ ] Create processing state tracker

**Estimated Time**: 1 hour  
**Files**: `src/lib/figma/translator.ts`

---

### Task 2.2: Implement Node Traversal
- [ ] Create `traverseNode()` recursive function
- [ ] Handle all major Figma node types:
  - [ ] CANVAS
  - [ ] FRAME
  - [ ] GROUP
  - [ ] RECTANGLE
  - [ ] TEXT
  - [ ] VECTOR
  - [ ] INSTANCE
  - [ ] COMPONENT
- [ ] Implement depth tracking
- [ ] Add node visibility filtering
- [ ] Handle missing children gracefully

**Estimated Time**: 2 hours  
**Files**: `src/lib/figma/translator.ts`

---

### Task 2.3: Create Node Type Mapper
- [ ] Create `mapNodeType()` function
- [ ] Map FRAME/GROUP → `div`
- [ ] Map TEXT → `p` or `span`
- [ ] Map RECTANGLE with image fill → `img`
- [ ] Map VECTOR → `svg` or `img`
- [ ] Add fallback to `div` for unknown types

**Estimated Time**: 45 minutes  
**Files**: `src/lib/figma/translator.ts`

---

### Task 2.4: Implement Content Extraction
- [ ] Create `extractContent()` function
- [ ] Extract `node.characters` for text nodes
- [ ] Handle multiline text
- [ ] Escape special characters (quotes, brackets)
- [ ] Handle empty content gracefully

**Estimated Time**: 30 minutes  
**Files**: `src/lib/figma/translator.ts`

---

### Task 2.5: Create Multi-Page Component Generator
- [ ] Identify top-level page/frame nodes
- [ ] Generate separate component for each page
- [ ] Create component naming strategy (sanitize names)
- [ ] Handle duplicate page names
- [ ] Return array of `GeneratedComponent` objects

**Estimated Time**: 1 hour  
**Files**: `src/lib/figma/translator.ts`

---

### Task 2.6: Implement JSX Element Builder
- [ ] Create `JSXElement` class or builder
- [ ] Add methods: `setType()`, `addStyle()`, `addProp()`
- [ ] Implement `addChild()` method
- [ ] Add `setContent()` for text nodes
- [ ] Create `toJSX()` method for string generation

**Estimated Time**: 1.5 hours  
**Files**: `src/lib/figma/translator.ts`

---

### Task 2.7: Test Basic Traversal
- [ ] Test with simple single-frame design
- [ ] Test with nested structure (3+ levels)
- [ ] Test with multi-page document
- [ ] Verify all node types are processed
- [ ] Check output JSX structure is valid

**Estimated Time**: 1 hour  
**Tools**: Sample Figma files

---

### Task 2.8: Add Error Recovery
- [ ] Wrap traversal in try-catch
- [ ] Continue processing on node errors
- [ ] Collect and report warnings
- [ ] Add fallback for corrupted nodes
- [ ] Log processing statistics

**Estimated Time**: 45 minutes  
**Files**: `src/lib/figma/translator.ts`

---

## 🎨 Phase 3: Tailwind Style Mapping

**Goal**: Convert Figma styles to accurate Tailwind CSS classes

### Task 3.1: Create Style Mapper Module
- [ ] Create `src/lib/figma/style-mapper.ts`
- [ ] Implement `StyleMapper` class
- [ ] Add `mapNode()` main method
- [ ] Create style accumulator array
- [ ] Add priority/order handling for classes

**Estimated Time**: 1 hour  
**Files**: `src/lib/figma/style-mapper.ts`

---

### Task 3.2: Implement Auto Layout → Flexbox
- [ ] Create `mapAutoLayout()` function
- [ ] Map `layoutMode: HORIZONTAL` → `flex flex-row`
- [ ] Map `layoutMode: VERTICAL` → `flex flex-col`
- [ ] Map `itemSpacing` → `gap-*` classes
- [ ] Map `primaryAxisAlignItems`:
  - [ ] MIN → `justify-start`
  - [ ] CENTER → `justify-center`
  - [ ] MAX → `justify-end`
  - [ ] SPACE_BETWEEN → `justify-between`
- [ ] Map `counterAxisAlignItems`:
  - [ ] MIN → `items-start`
  - [ ] CENTER → `items-center`
  - [ ] MAX → `items-end`

**Estimated Time**: 2 hours  
**Files**: `src/lib/figma/style-mapper.ts`

**Reference**: FIGMA_TOOL_DESIGN.md section "Auto Layout → Flexbox"

---

### Task 3.3: Implement Spacing & Dimensions
- [ ] Create `mapDimensions()` function
- [ ] Map `width` to Tailwind width classes
- [ ] Map `height` to Tailwind height classes
- [ ] Implement child resizing:
  - [ ] FILL_CONTAINER → `flex-1 w-full`
  - [ ] FIXED → `w-[Xpx]`
- [ ] Map padding (all sides):
  - [ ] Uniform padding → `p-*`
  - [ ] Individual sides → `pt-* pr-* pb-* pl-*`
- [ ] Use arbitrary values for non-standard sizes

**Estimated Time**: 1.5 hours  
**Files**: `src/lib/figma/style-mapper.ts`

---

### Task 3.4: Implement Color Mapping
- [ ] Create `mapColor()` function
- [ ] Convert Figma RGB (0-1) to hex (#RRGGBB)
- [ ] Generate `bg-[#HEX]` for background fills
- [ ] Generate `text-[#HEX]` for text fills
- [ ] Handle opacity with `bg-opacity-*`
- [ ] Map gradient fills (fallback to solid color)

**Estimated Time**: 1 hour  
**Files**: `src/lib/figma/style-mapper.ts`

---

### Task 3.5: Implement Typography Mapping
- [ ] Create `mapTypography()` function
- [ ] Map `fontSize` → `text-[Xpx]`
- [ ] Map `fontWeight` → `font-*` classes
- [ ] Map `lineHeight` → `leading-[Xpx]`
- [ ] Map `letterSpacing` → `tracking-*`
- [ ] Map `textAlignHorizontal` → `text-left/center/right`
- [ ] Map `textDecoration` → `underline/line-through`

**Estimated Time**: 1 hour  
**Files**: `src/lib/figma/style-mapper.ts`

---

### Task 3.6: Implement Visual Effects
- [ ] Create `mapEffects()` function
- [ ] Map `cornerRadius` → `rounded-*` or `rounded-[Xpx]`
- [ ] Map `strokes` → `border-*` classes
- [ ] Map `strokeWeight` → `border-[Xpx]`
- [ ] Map `effects` (shadows):
  - [ ] DROP_SHADOW → `shadow-*`
  - [ ] INNER_SHADOW → `shadow-inner`
- [ ] Handle multiple shadows (custom utility)

**Estimated Time**: 1.5 hours  
**Files**: `src/lib/figma/style-mapper.ts`

---

### Task 3.7: Test Style Mapping
- [ ] Test Auto Layout conversion
- [ ] Test color mapping accuracy
- [ ] Test typography mapping
- [ ] Test border/shadow effects
- [ ] Verify Tailwind class validity
- [ ] Test with complex nested layouts

**Estimated Time**: 1 hour  
**Tools**: Sample designs with varied styles

---

## 🖼️ Phase 4: Asset Management

**Goal**: Extract and integrate asset URLs into generated components

### Task 4.1: Create Asset Manager
- [ ] Create `src/lib/figma/asset-manager.ts`
- [ ] Implement `AssetManager` class
- [ ] Add `collectAssetNodes()` method
- [ ] Filter nodes with image fills or type VECTOR/IMAGE
- [ ] Return array of node IDs requiring assets

**Estimated Time**: 1 hour  
**Files**: `src/lib/figma/asset-manager.ts`

---

### Task 4.2: Implement Batch URL Fetching
- [ ] Implement `fetchAssetUrls()` method
- [ ] Chunk node IDs into batches of 100
- [ ] Call Figma `/v1/images/:file_key` for each batch
- [ ] Handle API rate limiting (retry with backoff)
- [ ] Collect all URLs into single array
- [ ] Add metadata (dimensions, type)

**Estimated Time**: 1.5 hours  
**Files**: `src/lib/figma/asset-manager.ts`

---

### Task 4.3: Integrate Assets into JSX
- [ ] Update JSX generator to accept asset map
- [ ] For image nodes, add `src` attribute with URL
- [ ] For background fills, add `style={{backgroundImage}}`
- [ ] Add `alt` attributes with node names
- [ ] Handle missing asset URLs gracefully

**Estimated Time**: 1 hour  
**Files**: `src/lib/figma/jsx-generator.ts`

---

### Task 4.4: Create Asset List Formatter
- [ ] Format asset URLs for client display
- [ ] Group by type (PNG, JPG, SVG)
- [ ] Calculate total size estimates
- [ ] Generate download metadata
- [ ] Create asset manifest JSON

**Estimated Time**: 45 minutes  
**Files**: `src/lib/figma/asset-manager.ts`

---

### Task 4.5: Test Asset Integration
- [ ] Test with design containing 10+ images
- [ ] Test vector → PNG conversion
- [ ] Verify URLs are valid and accessible
- [ ] Test batch processing with 100+ assets
- [ ] Check asset URLs in generated JSX

**Estimated Time**: 1 hour  
**Tools**: Image-heavy Figma file

---

## 🖥️ Phase 5: UI & Client Features

**Goal**: Build the user interface and interaction features

### Task 5.1: Create Tool Page
- [ ] Create `src/app/tools/code/figma-to-code/page.tsx`
- [ ] Add page metadata (title, description)
- [ ] Import and render main tool component
- [ ] Add basic layout structure
- [ ] Test page routing

**Estimated Time**: 30 minutes  
**Files**: `src/app/tools/code/figma-to-code/page.tsx`

---

### Task 5.2: Create Main Tool Component
- [ ] Create `src/components/tools/figma-to-code/FigmaExtractorTool.tsx`
- [ ] Set up state management (loading, data, error)
- [ ] Implement API call to `/api/figma-extract`
- [ ] Handle success and error responses
- [ ] Add loading state with progress indicator

**Estimated Time**: 2 hours  
**Files**: `src/components/tools/figma-to-code/FigmaExtractorTool.tsx`

---

### Task 5.3: Create Input Form Component
- [ ] Create `src/components/tools/figma-to-code/InputForm.tsx`
- [ ] Add URL input field with validation
- [ ] Add PAT input field with show/hide toggle
- [ ] Add "Extract Components" button
- [ ] Display validation errors inline
- [ ] Add example URL placeholder
- [ ] Add "Get PAT" help link to Figma docs

**Estimated Time**: 1.5 hours  
**Files**: `src/components/tools/figma-to-code/InputForm.tsx`

---

### Task 5.4: Create Component Tabs
- [ ] Create `src/components/tools/figma-to-code/ComponentTabs.tsx`
- [ ] Implement tab navigation for multiple pages
- [ ] Show component name in each tab
- [ ] Highlight active tab
- [ ] Add component stats (lines, elements)

**Estimated Time**: 1 hour  
**Files**: `src/components/tools/figma-to-code/ComponentTabs.tsx`

---

### Task 5.5: Create Code Display Component
- [ ] Create `src/components/tools/figma-to-code/CodeDisplay.tsx`
- [ ] Add syntax highlighting (use `react-syntax-highlighter` or custom)
- [ ] Make code scrollable with fixed height
- [ ] Add line numbers
- [ ] Add copy button in top-right corner
- [ ] Show character count

**Estimated Time**: 2 hours  
**Files**: `src/components/tools/figma-to-code/CodeDisplay.tsx`

**Note**: May need to install `react-syntax-highlighter`

---

### Task 5.6: Create Download Panel
- [ ] Create `src/components/tools/figma-to-code/DownloadPanel.tsx`
- [ ] Add "Copy Code" button with clipboard API
- [ ] Add "Download Assets" button (opens URLs in new tabs)
- [ ] Add "Download JSON" button (raw node tree)
- [ ] Add "Download Component" button (saves .tsx file)
- [ ] Show success toast on copy/download

**Estimated Time**: 1.5 hours  
**Files**: `src/components/tools/figma-to-code/DownloadPanel.tsx`

---

### Task 5.7: Create Asset List Component
- [ ] Create `src/components/tools/figma-to-code/AssetList.tsx`
- [ ] Display asset table (name, type, dimensions)
- [ ] Add thumbnail preview on hover
- [ ] Show total asset count
- [ ] Add "Download All" button
- [ ] Make list scrollable

**Estimated Time**: 1.5 hours  
**Files**: `src/components/tools/figma-to-code/AssetList.tsx`

---

### Task 5.8: Create Progress Indicator
- [ ] Create `src/components/tools/figma-to-code/ProgressIndicator.tsx`
- [ ] Show multi-step progress:
  - [ ] Connecting to Figma...
  - [ ] Fetching file data...
  - [ ] Translating components...
  - [ ] Generating asset URLs...
  - [ ] Finalizing...
- [ ] Add spinner/progress bar
- [ ] Estimate time remaining

**Estimated Time**: 1 hour  
**Files**: `src/components/tools/figma-to-code/ProgressIndicator.tsx`

---

### Task 5.9: Test Full User Flow
- [ ] Test complete extraction flow
- [ ] Test error scenarios (invalid inputs)
- [ ] Test copy to clipboard functionality
- [ ] Test download functionality
- [ ] Test responsive design on mobile
- [ ] Test dark mode compatibility

**Estimated Time**: 1.5 hours  
**Tools**: Browser DevTools

---

## ✅ Phase 6: Testing & Polish

**Goal**: Ensure reliability, performance, and excellent UX

### Task 6.1: Write Unit Tests
- [ ] Test `FigmaClient.parseFileKey()`
- [ ] Test `mapAutoLayout()` with various inputs
- [ ] Test `mapColor()` conversion accuracy
- [ ] Test `traverseNode()` with mock data
- [ ] Test JSX generation output
- [ ] Achieve 80%+ code coverage

**Estimated Time**: 3 hours  
**Tools**: Jest, React Testing Library

---

### Task 6.2: Integration Testing
- [ ] Test full API → Client flow
- [ ] Test with real Figma files (5+ different designs)
- [ ] Test with large files (100+ nodes)
- [ ] Test error handling across all layers
- [ ] Test rate limiting behavior

**Estimated Time**: 2 hours  
**Tools**: Postman, Browser DevTools

---

### Task 6.3: Performance Optimization
- [ ] Profile API response time
- [ ] Optimize recursive traversal (memoization)
- [ ] Implement request caching
- [ ] Lazy load code syntax highlighting
- [ ] Minimize bundle size
- [ ] Test with 1000+ node file

**Estimated Time**: 2 hours  
**Tools**: Chrome DevTools Performance tab

---

### Task 6.4: Documentation
- [ ] Add JSDoc comments to all public methods
- [ ] Create README for tool usage
- [ ] Document PAT setup process
- [ ] Add troubleshooting guide
- [ ] Create video demo (optional)

**Estimated Time**: 2 hours  
**Files**: README, inline comments

---

### Task 6.5: UI Polish
- [ ] Add smooth transitions
- [ ] Improve loading animations
- [ ] Add helpful tooltips
- [ ] Add keyboard shortcuts (Ctrl+C for copy)
- [ ] Add empty state illustrations
- [ ] Improve error messages with actionable steps

**Estimated Time**: 2 hours  
**Files**: All UI components

---

### Task 6.6: Final QA & Bug Fixes
- [ ] Test all edge cases
- [ ] Fix any discovered bugs
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verification
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Performance verification

**Estimated Time**: 3 hours  
**Tools**: Browser testing suite

---

## 📋 Quick Start Checklist

Use this for quick daily reference:

### Week 1: Foundation
- [ ] Day 1-2: Phase 1 (Setup & API)
- [ ] Day 3-4: Phase 2 (Translation Engine)
- [ ] Day 5: Begin Phase 3 (Style Mapping)

### Week 2: Core Features
- [ ] Day 6-7: Complete Phase 3 (Style Mapping)
- [ ] Day 8-9: Phase 4 (Asset Management)
- [ ] Day 10: Begin Phase 5 (UI)

### Week 3: Polish
- [ ] Day 11-13: Complete Phase 5 (UI & Client)
- [ ] Day 14-15: Phase 6 (Testing & Polish)

---

## 🚨 Blockers & Dependencies

| Blocker | Impact | Resolution |
|---------|--------|------------|
| Figma API rate limits | High | Implement caching, request throttling |
| Complex gradient mappings | Medium | Fallback to solid color approximation |
| SVG → JSX conversion | Medium | Use img tags with asset URLs instead |
| Large file timeouts | Medium | Implement streaming/chunked processing |

---

## 📊 Definition of Done

A task is complete when:
- ✅ Code is written and follows project conventions
- ✅ TypeScript has no errors
- ✅ Manual testing passes
- ✅ Error handling is implemented
- ✅ Code is committed with clear message

---

## 🎯 Success Criteria

The tool is ready for production when:
- ✅ Can extract 95%+ of common Figma elements
- ✅ Generates valid, compilable JSX
- ✅ Tailwind classes are 90%+ accurate
- ✅ Processes typical file in < 10 seconds
- ✅ Zero security vulnerabilities
- ✅ All error cases handled gracefully
- ✅ Mobile-responsive UI
- ✅ All Phase 6 tests passing

---

## 📝 Notes

- Keep PAT security as top priority throughout
- Test with varied Figma files regularly
- Document any Figma API quirks discovered
- Consider adding more output formats (Vue, React Native) in future

---

**Last Updated**: October 31, 2025  
**Total Estimated Time**: 60-80 hours  
**Target Completion**: 2-3 weeks  
**Status**: Ready to Start 🚀
