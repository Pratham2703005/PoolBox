# **Figma-to-Next.js/Tailwind Blueprint: Data Extractor**

## **🎯 Project Goal**

To build a powerful server-side tool that takes a user's Figma file link and PAT, translates the design structure into modular, ready-to-use **React JSX component strings** (one for each main Figma page/frame), and provides direct **Figma asset URLs** and **raw file data** for high-precision UI replication within an existing Next.js/Tailwind project.

## **🏗️ Technical Stack and Prerequisites**

| Category | Technology/Library | Purpose |
| :---- | :---- | :---- |
| **Frontend/Framework** | Next.js (App Router) | Used to host the extraction utility and securely handle server-side processing. |
| **Styling** | Tailwind CSS | **Output Style:** The generated JSX components will exclusively use Tailwind utility classes. |
| **API Client** | axios or node-fetch | Handling secure, token-authenticated requests to the Figma REST API. |
| **Utility** | lodash (or similar) | General utility functions for deep JSON traversal and data manipulation. |
| **Asset Handling** | **Figma REST API** | **Directly generating temporary asset URLs** for immediate use in JSX components. |

## **II. Architectural Flow & Data Pipeline (Updated)**

The focus is now on processing, translating, and preparing the output data for the frontend display/download buttons.

1. **User Input:** User provides the **Figma URL** and **PAT**.  
2. **API Handler (Server):**  
   * Fetches the **Node Tree JSON** (/v1/files/:file\_key).  
   * **Initiates the Translation Engine** and Asset URL generation.  
3. **Translation Engine (Server):**  
   * **Traversal:** Recursively processes the Node Tree.  
   * **Style Mapper:** Converts all styles and Auto Layout rules into Tailwind class strings.  
   * **JSX Generation:** Creates an array of JSX strings, one for each Figma page/frame (Page1.jsx, Page2.jsx).  
4. **Asset URL Generation (Server):**  
   * Identifies all raster and vector elements.  
   * Batch calls /v1/images/:file\_key to obtain **temporary public URLs** for all assets.  
   * **Integrates these URLs** directly into the generated JSX code (using \<img src="..." /\> or style={{backgroundImage: 'url(...)'}}).  
5. **Final Output (Server** $\\rightarrow$ **Client):**  
   * Returns the array of generated JSX strings, the raw Node Tree JSON, and the list of raw asset URLs to the frontend.

## **III. Detailed 5-Phase Development Plan (Refined)**

### **Phase 1: Setup and API Connection**

| Step | Detail | Priority |
| :---- | :---- | :---- |
| **1.1 UI & Auth** | Create the client component UI to collect the Figma URL and PAT. Use a Next.js Server Action to handle the form submission securely. | High |
| **1.2 Figma Client** | Implement FigmaClient using axios to handle authentication and file key parsing. | High |
| **1.3 Node Retrieval** | Make the initial API call to GET /v1/files/:file\_key to retrieve the entire Node Tree JSON. | High |

### **Phase 2: Structural Analysis and JSX Tree Construction**

The goal is to establish the parent-child \<div\> relationships and static content.

| Step | Detail | Priority |
| :---- | :---- | :---- |
| **2.1 Recursive Traversal** | Implement a recursive function (traverseNode) to process the Node Tree and identify individual page/frame nodes. | High |
| **2.2 Multi-Page Component Generation** | For each top-level Figma page/frame, generate a distinct, self-contained React component string (e.g., Page1.jsx). | High |
| **2.3 Element Mapping** | Map all Figma Node Types to base React components (\<div /\>, \<p /\>, \<img /\> placeholders). | High |
| **2.4 Content Injection** | Extract node.characters and place the string content within the corresponding JSX element. | High |

### **Phase 3: Tailwind Style Mapping (The Core Logic)**

| Step | Detail | Priority |
| :---- | :---- | :---- |
| **3.1 Auto Layout** $\\rightarrow$ **Flex** | Translate layoutMode, alignment, and spacing into flex, flex-row/flex-col, and gap- utilities. | Critical |
| **3.2 Spacing & Dimensions** | Convert pixel values for padding and spacing to Tailwind utilities. Use arbitrary syntax (w-\[Xpx\]) for fixed dimensions. | Critical |
| **3.3 Visual Styles** | Map fills, strokes, radius, and shadow effects to Tailwind classes. Implement a utility to efficiently map Figma colors to Tailwind's color palette where possible. | High |

### **Phase 4: Asset URL Integration and Final Data Output**

This phase integrates asset links and finalizes all data deliverables.

| Step | Detail | Priority |
| :---- | :---- | :---- |
| **4.1 Asset URL Generation** | Collect Node IDs for all raster/vector elements. Batch call GET /v1/images/:file\_key to acquire **temporary public asset URLs**. | Critical |
| **4.2 JSX URL Integration** | Update the generated JSX components from Phase 3 to use these direct, temporary URLs in their src attributes or style properties. **(Assets are not downloaded locally by the tool).** | Critical |
| **4.3 Prepare Raw Data Output** | Prepare the following data structures for client download: 1\. **Raw Node Tree JSON**. 2\. **List of all Asset URLs** (for bulk download). | High |

### **Phase 5: Client Delivery and Download Options**

The server returns the translated data, and the client displays options for use and download. **(No ZIP file is generated).**

| Step | Detail | Priority |
| :---- | :---- | :---- |
| **5.1 Display Code Output** | The client UI displays the generated array of JSX strings, allowing the user to view and copy the component code for each page. | High |
| **5.2 Implement Download Buttons** | Provide specific buttons for users to download the raw content prepared in Phase 4: | High |
|  | a) **Download All Assets:** Triggers the batch download of files from the prepared URL list. |  |
|  | b) **Download Structure JSON:** Downloads the raw Figma Node Tree JSON. |  |
|  | c) **Copy Code:** Button to copy the active JSX component string to the clipboard. |  |

## **IV. Core Translation Logic Detail**

The reliability of the tool hinges on a precise **Figma-to-Tailwind Style Mapping**.

### **1\. Auto Layout (Flexbox) Conversion Rules**

These rules prioritize Flexbox, as it is the most common translation for Auto Layout.

| Figma Auto Layout Property | Tailwind CSS Equivalent | Notes |
| :---- | :---- | :---- |
| layoutMode: "HORIZONTAL" | flex flex-row | Base for horizontal flow. |
| layoutMode: "VERTICAL" | flex flex-col | Base for vertical flow. |
| itemSpacing (e.g., 16px) | gap-4 | Use consistent Tailwind spacing scale (1 unit \= 4px). |
| primaryAxisAlign: "SPACE\_BETWEEN" | justify-between | Directly maps to space-between. |
| primaryAxisAlign: "CENTER" | justify-center | Maps to the main axis center alignment. |
| counterAxisAlignItems: "CENTER" | items-center | Maps to the cross-axis center alignment. |
| **Child Resizing** (horizontal: "FILL\_CONTAINER") | flex-1 w-full | Crucial for dynamic width/height elements. |
| **Child Resizing** (horizontal: "FIXED") | w-\[Xpx\] | Use arbitrary value syntax for exact pixel width. |

### **2\. Styling and Typography Mapping**

| Figma Property | Figma Value Example | Tailwind Utility Generation |
| :---- | :---- | :---- |
| **Color (Solid Fill)** | \#123456 or {r,g,b,a} | bg-\[\#123456\] |
| **Border Radius** | cornerRadius: 12 | rounded-\[12px\] |
| **Box Shadow** | type: "DROP\_SHADOW" | shadow-xl or custom shadow-\[...px\] utility. |
| **Font Size** | fontSize: 28 | text-\[28px\] |
| **Font Weight** | fontWeight: 700 | font-bold |
| **Line Height** | lineHeightPx: 32 | leading-\[32px\] |

By strictly defining and implementing these translation rules, your tool will generate highly readable Tailwind CSS that accurately reflects the Figma design.