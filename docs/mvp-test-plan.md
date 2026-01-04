# MVP Test Plan - Axen AI Agent Platform

**Version:** 1.0
**Date:** 2026-01-04
**Milestone:** MVP-M1 & MVP-M2
**Platform:** macOS (Development Mode)

---

## Test Overview

**Purpose:** Validate all MVP-M1 features before proceeding to MVP-M2 user testing

**Scope:**
- Loading indicators
- Error handling
- Conversation persistence
- Natural language responses
- MCP server integration
- UI/UX functionality

**Testing Method:** Manual testing (Automated tests post-MVP)

---

## Test Environment Setup

### Prerequisites
- ✅ Tauri app running (`npm run tauri:dev`)
- ✅ Gemini API key configured in `.env`
- ✅ Test files prepared on Desktop
- ✅ MCP Filesystem Server available

### Test Files Needed
```bash
# Create test files
echo "Hello World\nThis is a test file." > ~/Desktop/test.txt
mkdir -p ~/Desktop/test-folder
echo "File 1" > ~/Desktop/test-folder/file1.txt
echo "File 2" > ~/Desktop/test-folder/file2.txt
```

---

## Feature Test Cases

### 1. Loading Indicators

**Test ID:** MVP-M1-001
**Feature:** Loading indicators with animated dots
**Priority:** High

**Test Steps:**
1. Open Axen app
2. Go to MCP Servers tab → Connect Filesystem Server
3. Return to Chat tab
4. Type: `read file /Users/sam_lin/Desktop/test.txt`
5. Press Enter

**Expected Result:**
- ✅ Loading message appears immediately: "🔧 **Reading file:** `test.txt`..."
- ✅ Animated dots appear (•••)
- ✅ Loading indicator disappears when result arrives
- ✅ Response appears within 3 seconds

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 2. Error Handling - File Not Found

**Test ID:** MVP-M1-002
**Feature:** User-friendly error messages
**Priority:** High

**Test Steps:**
1. Ensure MCP Filesystem Server is connected
2. Type: `read file /Users/sam_lin/Desktop/nonexistent.txt`
3. Press Enter

**Expected Result:**
```
❌ Error reading file

No such file or directory (os error 2)

Path: /Users/sam_lin/Desktop/nonexistent.txt

Tip: Make sure the file path is correct and the file exists.
```

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 3. Error Handling - MCP Not Connected

**Test ID:** MVP-M1-003
**Feature:** MCP connection reminder
**Priority:** High

**Test Steps:**
1. Go to MCP Servers tab
2. Disconnect Filesystem Server (if connected)
3. Return to Chat tab
4. Type: `read file /Users/sam_lin/Desktop/test.txt`
5. Press Enter

**Expected Result:**
```
⚠️ MCP Server Not Connected

I detected that you want to access files, but no MCP servers are currently connected.

To enable file access:
1. Go to the MCP Servers tab
2. Click Connect on the Filesystem Server
3. Come back to Chat and try again

Note: File operations require MCP server permissions.
```

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 4. Natural Language Response - Read File

**Test ID:** MVP-M1-004
**Feature:** Natural language file read response
**Priority:** High

**Test Steps:**
1. Ensure MCP Filesystem Server is connected
2. Type: `read file /Users/sam_lin/Desktop/test.txt`
3. Press Enter

**Expected Result:**
- ✅ Response starts with: "I successfully read the file **test.txt**"
- ✅ Shows file details: Lines count, Characters count
- ✅ Shows content in code block
- ✅ Shows full path at bottom
- ✅ Formatted in markdown

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 5. Natural Language Response - List Directory

**Test ID:** MVP-M1-005
**Feature:** Natural language directory listing
**Priority:** High

**Test Steps:**
1. Ensure MCP Filesystem Server is connected
2. Type: `list files /Users/sam_lin/Desktop`
3. Press Enter

**Expected Result:**
- ✅ Response starts with: "I found **X items** in the directory **Desktop**"
- ✅ Shows numbered file list (1. filename, 2. filename, etc.)
- ✅ Shows full path at bottom
- ✅ Formatted in markdown

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 6. Conversation Persistence

**Test ID:** MVP-M1-006
**Feature:** localStorage conversation persistence
**Priority:** High

**Test Steps:**
1. Send 3-5 messages in chat
2. Note the message content
3. Refresh the page (Cmd+R or F5)
4. Check if messages are restored

**Expected Result:**
- ✅ All messages restored after refresh
- ✅ Message order preserved
- ✅ Timestamps preserved
- ✅ User and assistant messages both restored

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 7. Clear Chat Functionality

**Test ID:** MVP-M1-007
**Feature:** Clear button clears chat history
**Priority:** Medium

**Test Steps:**
1. Send several messages in chat
2. Click "Clear" button at bottom
3. Check if chat is cleared

**Expected Result:**
- ✅ All messages cleared immediately
- ✅ Welcome message appears
- ✅ localStorage cleared
- ✅ No confirm dialog (Tauri compatibility)

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 8. Tab Navigation

**Test ID:** MVP-M1-008
**Feature:** Tab-style navigation between Chat and MCP Servers
**Priority:** Medium

**Test Steps:**
1. Click "MCP Servers" tab
2. Verify view changes
3. Click "Chat" tab
4. Verify view changes back

**Expected Result:**
- ✅ Active tab has white background (#fffcf5)
- ✅ Active tab connects to content area (no border at bottom)
- ✅ Inactive tabs have beige background (#e2d8c3)
- ✅ Tab text is bold when active
- ✅ View switches correctly

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 9. MCP Server Connection

**Test ID:** MVP-M1-009
**Feature:** MCP server connection status
**Priority:** High

**Test Steps:**
1. Go to "MCP Servers" tab
2. Click "Connect" on Filesystem Server
3. Wait for connection
4. Check status indicator

**Expected Result:**
- ✅ Status changes from "Disconnected" to "Connected"
- ✅ Status badge shows sage green color (#6fa372)
- ✅ Tools count appears in Chat tab (e.g., "🔧 2 tools")
- ✅ Connection completes within 2 seconds

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 10. MCP Server Disconnection

**Test ID:** MVP-M1-010
**Feature:** MCP server disconnection
**Priority:** Medium

**Test Steps:**
1. Ensure Filesystem Server is connected
2. Click "Disconnect" button
3. Check status indicator

**Expected Result:**
- ✅ Status changes to "Disconnected"
- ✅ Tools count disappears from Chat tab
- ✅ File operations show MCP not connected warning

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 11. Pattern Matching - Variations

**Test ID:** MVP-M1-011
**Feature:** Pattern matching accepts multiple phrasings
**Priority:** Medium

**Test Steps:**
Test each command variation:
1. `read file /Users/sam_lin/Desktop/test.txt`
2. `read files /Users/sam_lin/Desktop/test.txt`
3. `read the file /Users/sam_lin/Desktop/test.txt`
4. `list files /Users/sam_lin/Desktop`
5. `list /Users/sam_lin/Desktop`

**Expected Result:**
- ✅ All variations trigger file operations
- ✅ Singular and plural both work
- ✅ "the" is optional
- ✅ Path is correctly extracted

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 12. Streaming Chat Response

**Test ID:** MVP-M1-012
**Feature:** Gemini streaming responses (non-MCP queries)
**Priority:** Medium

**Test Steps:**
1. Type: `What is machine learning?`
2. Press Enter
3. Observe response appearing

**Expected Result:**
- ✅ Response appears progressively (streaming)
- ✅ Text appears word-by-word or chunk-by-chunk
- ✅ No loading indicator (streaming shows progress)
- ✅ Response completes within 5 seconds

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 13. UI Theme Consistency

**Test ID:** MVP-M1-013
**Feature:** Warm beige/brown theme applied consistently
**Priority:** Low

**Test Steps:**
1. Check all UI elements for theme consistency
2. Verify color palette matches:
   - Primary: #a67c52 (brown)
   - Background: #fffcf5 (warm white)
   - Secondary: #f5f1e6 (light beige)
   - Borders: #dbd0ba
   - Text: #4a3f35, #7d6b56

**Expected Result:**
- ✅ Header uses theme colors
- ✅ Chat messages use theme colors
- ✅ Buttons use theme colors
- ✅ MCP Servers page uses theme colors
- ✅ No dark mode remnants

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 14. Window Title

**Test ID:** MVP-M1-014
**Feature:** Window title shows "Axen" branding
**Priority:** Low

**Test Steps:**
1. Check window title bar
2. Check browser tab title

**Expected Result:**
- ✅ Window title: "Axen - AI Agent Platform"
- ✅ Browser tab title: "Axen - AI Agent Platform"
- ✅ No "Dive" references

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 15. Sticky Header

**Test ID:** MVP-M1-015
**Feature:** Header remains fixed when scrolling
**Priority:** Low

**Test Steps:**
1. Send enough messages to make chat scrollable
2. Scroll down in chat area
3. Observe header behavior

**Expected Result:**
- ✅ Header stays at top when scrolling
- ✅ Header doesn't overlap content
- ✅ Chat content scrolls under header

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

## Performance Tests

### 16. File Read Performance

**Test ID:** MVP-M1-016
**Feature:** File read response time
**Priority:** Medium

**Test Steps:**
1. Read small file (< 1KB): `read file /Users/sam_lin/Desktop/test.txt`
2. Measure time from Enter to response

**Expected Result:**
- ✅ Response within 3 seconds
- ✅ Loading indicator shows immediately
- ✅ No UI freezing

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 17. Directory Listing Performance

**Test ID:** MVP-M1-017
**Feature:** Directory listing response time
**Priority:** Medium

**Test Steps:**
1. List directory with ~20 files: `list files /Users/sam_lin/Desktop`
2. Measure time from Enter to response

**Expected Result:**
- ✅ Response within 3 seconds
- ✅ All files listed correctly
- ✅ No timeout errors

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

## Edge Cases

### 18. Path with Spaces

**Test ID:** MVP-M1-018
**Feature:** Handle file paths with spaces
**Priority:** Medium

**Test Steps:**
1. Create file with space: `~/Desktop/test file.txt`
2. Type: `read file /Users/sam_lin/Desktop/test file.txt`
3. Press Enter

**Expected Result:**
- ✅ File read successfully
- ✅ Spaces handled correctly
- ✅ No path parsing errors

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 19. Very Long File

**Test ID:** MVP-M1-019
**Feature:** Handle large files gracefully
**Priority:** Low

**Test Steps:**
1. Create large file (>10KB)
2. Try to read it
3. Observe behavior

**Expected Result:**
- ✅ File content displayed (may be slow)
- ✅ No UI crash
- ✅ Clear response or truncation notice

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 20. Empty Directory

**Test ID:** MVP-M1-020
**Feature:** Handle empty directory listing
**Priority:** Low

**Test Steps:**
1. Create empty directory: `mkdir ~/Desktop/empty-folder`
2. Type: `list files /Users/sam_lin/Desktop/empty-folder`
3. Press Enter

**Expected Result:**
- ✅ Message: "I found 0 items in the directory empty-folder"
- ✅ No error shown
- ✅ Clear indication of empty directory

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

## Regression Tests

### 21. Multiple Rapid Commands

**Test ID:** MVP-M1-021
**Feature:** Handle rapid successive commands
**Priority:** Medium

**Test Steps:**
1. Send 5 file read commands rapidly (without waiting)
2. Observe behavior

**Expected Result:**
- ✅ All commands queue and execute
- ✅ No commands lost
- ✅ Responses appear in order
- ✅ No UI freezing

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

### 22. Clear During Loading

**Test ID:** MVP-M1-022
**Feature:** Clear chat while loading
**Priority:** Low

**Test Steps:**
1. Send a file read command
2. Immediately click "Clear" while loading
3. Observe behavior

**Expected Result:**
- ✅ Chat clears successfully
- ✅ Loading operation cancels (or completes silently)
- ✅ No error shown

**Actual Result:** _[To be filled during testing]_

**Status:** ⏳ Pending

---

## Test Summary Report

### Test Execution Date
_[To be filled]_

### Test Results Overview
| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Passed | 0 | 0% |
| ❌ Failed | 0 | 0% |
| ⏳ Pending | 22 | 100% |
| ⏭️ Skipped | 0 | 0% |

### Critical Issues Found
_[To be filled during testing]_

### Non-Critical Issues Found
_[To be filled during testing]_

### Recommendations
_[To be filled after testing]_

---

## Sign-Off

**Tested By:** _______________
**Date:** _______________
**Status:** ⏳ Not Started / 🔄 In Progress / ✅ Complete
**Ready for MVP-M2:** ☐ Yes ☐ No

---

**Next Steps:**
1. Execute all test cases
2. Document results
3. Fix critical issues
4. Re-test failures
5. Proceed to MVP-M2 user testing

---

**Last Updated:** 2026-01-04
**Document Owner:** QA Team
