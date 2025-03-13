function embedChatbot() {
  const chatBtnId = 'fastgpt-chatbot-button';
  const chatWindowId = 'fastgpt-chatbot-window';
  const script = document.getElementById('chatbot-iframe');
  var botSrc = script?.getAttribute('data-bot-src');
  const defaultOpen = script?.getAttribute('data-default-open') === 'true';
  const canDrag = script?.getAttribute('data-drag') === 'true';
  const MessageIcon =
    script?.getAttribute('data-open-icon') ||
    `data:image/svg+xml;base64,PHN2ZyB0PSIxNjkwNTMyNzg1NjY0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQxMzIiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNNTEyIDMyQzI0Ny4wNCAzMiAzMiAyMjQgMzIgNDY0QTQxMC4yNCA0MTAuMjQgMCAwIDAgMTcyLjQ4IDc2OEwxNjAgOTY1LjEyYTI1LjI4IDI1LjI4IDAgMCAwIDM5LjA0IDIyLjRsMTY4LTExMkE1MjguNjQgNTI4LjY0IDAgMCAwIDUxMiA4OTZjMjY0Ljk2IDAgNDgwLTE5MiA0ODAtNDMyUzc3Ni45NiAzMiA1MTIgMzJ6IG0yNDQuOCA0MTZsLTM2MS42IDMwMS43NmExMi40OCAxMi40OCAwIDAgMS0xOS44NC0xMi40OGw1OS4yLTIzMy45MmgtMTYwYTEyLjQ4IDEyLjQ4IDAgMCAxLTcuMzYtMjMuMzZsMzYxLjYtMzAxLjc2YTEyLjQ4IDEyLjQ4IDAgMCAxIDE5Ljg0IDEyLjQ4bC01OS4yIDIzMy45MmgxNjBhMTIuNDggMTIuNDggMCAwIDEgOCAyMi4wOHoiIGZpbGw9IiM0ZTgzZmQiIHAtaWQ9IjQxMzMiPjwvcGF0aD48L3N2Zz4=`;
  const CloseIcon =
    script?.getAttribute('data-close-icon') ||
    'data:image/svg+xml;base64,PHN2ZyB0PSIxNjkwNTM1NDQxNTI2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjYzNjciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNNTEyIDEwMjRBNTEyIDUxMiAwIDEgMSA1MTIgMGE1MTIgNTEyIDAgMCAxIDAgMTAyNHpNMzA1Ljk1NjU3MSAzNzAuMzk1NDI5TDQ0Ny40ODggNTEyIDMwNS45NTY1NzEgNjUzLjYwNDU3MWE0NS41NjggNDUuNTY4IDAgMSAwIDY0LjQzODg1OCA2NC40Mzg4NThMNTEyIDU3Ni41MTJsMTQxLjYwNDU3MSAxNDEuNTMxNDI5YTQ1LjU2OCA0NS41NjggMCAwIDAgNjQuNDM4ODU4LTY0LjQzODg1OEw1NzYuNTEyIDUxMmwxNDEuNTMxNDI5LTE0MS42MDQ1NzFhNDUuNTY4IDQ1LjU2OCAwIDEgMC02NC40Mzg4NTgtNjQuNDM4ODU4TDUxMiA0NDcuNDg4IDM3MC4zOTU0MjkgMzA1Ljk1NjU3MWE0NS41NjggNDUuNTY4IDAgMCAwLTY0LjQzODg1OCA2NC40Mzg4NTh6IiBmaWxsPSIjNGU4M2ZkIiBwLWlkPSI2MzY4Ij48L3BhdGg+PC9zdmc+';

  if (!botSrc) {
    console.error(`Can't find appid`);
    return;
  }
  if (document.getElementById(chatBtnId)) {
    return;
  }

  const ChatBtn = document.createElement('div');
  ChatBtn.id = chatBtnId;
  ChatBtn.style.cssText =
    'position: fixed; bottom: 30px; right: 60px; width: 40px; height: 40px; cursor: pointer; z-index: 2147483647; transition: 0;';

  // btn icon
  const ChatBtnDiv = document.createElement('img');
  ChatBtnDiv.src = defaultOpen ? CloseIcon : MessageIcon;
  ChatBtnDiv.setAttribute('width', '100%');
  ChatBtnDiv.setAttribute('height', '100%');
  ChatBtnDiv.draggable = false;

  let isResizing = false;
  let currentX = 0;
  let currentY = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let resizeDirection = '';

  const globalOverlay = document.createElement('div');
  globalOverlay.style.cssText =
    'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: transparent; display: none; z-index: 2147483646; cursor: default;';
  document.body.appendChild(globalOverlay);

  fetch(botSrc, {
    // mode: 'no-cors', // 添加no-cors模式来忽略跨域
    headers: {
      Accept: 'text/html',
      'Content-Type': 'text/html'
    }
  })
    .then((response) => {
      // console.log('response status:', response.status);
      return response.text();
    })
    .then((htmlContent) => {
      // console.log('htmlContent', htmlContent);
      const div = document.createElement('div');
      div.id = chatWindowId;
      div.style.cssText =
        'padding: 5px; border: none; position: fixed; flex-direction: column; justify-content: space-between; box-shadow: rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px; bottom: 80px; right: 60px; width: 60%; height: 667px; max-width: 90vw; max-height: 90vh; display: flex; z-index: 2147483647; overflow: hidden; left: unset; background-color: transparent; user-select: none; -webkit-user-select: none;';
      div.style.visibility = defaultOpen ? 'unset' : 'hidden';

      div.innerHTML = htmlContent;
      document.body.appendChild(div);

      const chatoverlay = document.createElement('div');
      chatoverlay.style.cssText =
        'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; display: none; z-index: 10;';
      div.appendChild(chatoverlay);

      div.addEventListener('mousemove', (e) => {
        const rect = div.getBoundingClientRect();
        const edgeSize = 5;
        const isLeftEdge = Math.abs(rect.left - e.clientX) <= edgeSize;
        const isTopEdge = Math.abs(rect.top - e.clientY) <= edgeSize;

        div.style.cursor = isLeftEdge ? 'ew-resize' : isTopEdge ? 'ns-resize' : 'default';
      });

      // 添加鼠标按下事件
      div.addEventListener('mousedown', (e) => {
        const rect = div.getBoundingClientRect();
        const edgeSize = 5;

        if (Math.abs(rect.left - e.clientX) <= edgeSize) {
          isResizing = true;
          resizeDirection = 'left';
          currentX = e.clientX;
          initialWidth = rect.width;
          initialLeft = rect.left;
        } else if (Math.abs(rect.top - e.clientY) <= edgeSize) {
          isResizing = true;
          resizeDirection = 'top';
          currentY = e.clientY;
          initialHeight = rect.height;
          initialTop = rect.top;
        }

        if (isResizing) {
          chatoverlay.style.display = 'block';
          globalOverlay.style.display = 'block';
        }
      });

      // 添加鼠标移动事件
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        if (resizeDirection === 'left') {
          const deltaX = e.clientX - currentX;
          const newWidth = Math.min(Math.max(initialWidth - deltaX, 300), window.innerWidth * 0.9);
          const newLeft = initialLeft + initialWidth - newWidth;
          div.style.width = newWidth + 'px';
          div.style.left = newLeft + 'px';
        } else if (resizeDirection === 'top') {
          const deltaY = e.clientY - currentY;
          const newHeight = Math.min(
            Math.max(initialHeight - deltaY, 300),
            window.innerHeight * 0.85
          );
          const newTop = initialTop + initialHeight - newHeight;
          div.style.height = newHeight + 'px';
          div.style.top = newTop + 'px';
        }
      });

      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          resizeDirection = '';
          chatoverlay.style.display = 'none';
          globalOverlay.style.display = 'none';
        }
      });
    })
    .catch((error) => {
      console.error('Error loading content:', error);
    });

  // const iframe = document.createElement('iframe');
  // iframe.allow = '*';
  // iframe.referrerPolicy = 'no-referrer';
  // iframe.title = 'FastGPT Chat Window';
  // iframe.id = chatWindowId;
  // iframe.src = botSrc;
  // iframe.style.cssText =
  //   'border: none; position: fixed; flex-direction: column; justify-content: space-between; box-shadow: rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px; bottom: 80px; right: 60px; width: 60%; height: 667px; max-width: 90vw; max-height: 85vh; border-radius: 0.75rem; display: flex; z-index: 2147483647; overflow: hidden; left: unset; background-color: #F3F4F6;';
  // iframe.style.visibility = defaultOpen ? 'unset' : 'hidden';
  // console.log('botSrc', botSrc);
  // document.body.appendChild(iframe);

  // document.addEventListener('click', function (event) {
  //   const chatWindow = document.getElementById(chatWindowId);
  //   if (!chatWindow) return;

  //   if (
  //     event.target === chatWindow ||
  //     chatWindow?.contains(event.target) ||
  //     event.target === ChatBtn ||
  //     ChatBtn?.contains(event.target)
  //   ) {
  //     return;
  //   }
  //   // console.log('close');
  //   const visibilityVal = chatWindow.style.visibility;
  //   if (visibilityVal === 'unset') {
  //     chatWindow.style.visibility = 'hidden';
  //     ChatBtnDiv.src = MessageIcon;
  //   }
  // });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-bot-src') {
        const newBotSrc = script.getAttribute('data-bot-src');
        if (newBotSrc) {
          iframe.src = newBotSrc;
        }
      }
    });
  });
  observer.observe(script, {
    attributes: true,
    attributeFilter: ['data-bot-src']
  });

  let chatBtnDragged = false;
  let chatBtnDown = false;
  let chatBtnMouseX;
  let chatBtnMouseY;
  ChatBtn.addEventListener('click', function () {
    if (chatBtnDragged) {
      chatBtnDragged = false;
      return;
    }
    const chatWindow = document.getElementById(chatWindowId);

    if (!chatWindow) return;
    const visibilityVal = chatWindow.style.visibility;
    if (visibilityVal === 'hidden') {
      chatWindow.style.visibility = 'unset';
      ChatBtnDiv.src = CloseIcon;
    } else {
      chatWindow.style.visibility = 'hidden';
      ChatBtnDiv.src = MessageIcon;
    }
  });

  ChatBtn.addEventListener('mousedown', (e) => {
    e.stopPropagation();

    if (!chatBtnMouseX && !chatBtnMouseY) {
      chatBtnMouseX = e.clientX;
      chatBtnMouseY = e.clientY;
    }

    chatBtnDown = true;
  });

  window.addEventListener('mousemove', (e) => {
    e.stopPropagation();
    if (!canDrag || !chatBtnDown) return;

    chatBtnDragged = true;
    const transformX = e.clientX - chatBtnMouseX;
    const transformY = e.clientY - chatBtnMouseY;

    ChatBtn.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
  });

  window.addEventListener('mouseup', (e) => {
    chatBtnDown = false;
  });

  ChatBtn.appendChild(ChatBtnDiv);
  document.body.appendChild(ChatBtn);
}
window.addEventListener('load', embedChatbot);

