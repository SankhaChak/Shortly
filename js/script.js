const link = document.querySelector('.link__here');
const linkForm = document.querySelector('.shorten__link');
const linkHistoryContainer = document.querySelector('.short__links');
const errorMsg = document.querySelector('.error__message');
const urlPattern = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
  'i'
);

let shortLinks = [];

function addShortLink(userLink, shortLink) {
  const divLink = document.createElement('div');
  divLink.classList.add('link');
  divLink.innerHTML = `
    <p class="user__link">${userLink}</p>
    <p class="short__link">${shortLink}</p>
    <button class="btn__square copy__btn">Copy</button>
  `;
  linkHistoryContainer.append(divLink);
}

async function shortenUrl(userLink) {
  const linkRequest = {
    destination: `${userLink}`,
    domain: { fullName: 'rebrand.ly' },
  };

  const requestHeaders = {
    'Content-Type': 'application/json',
    apikey: 'f9cad57dac3840d292dd639fbe4a2a08',
  };

  const response = await fetch('https://api.rebrandly.com/v1/links', {
    method: 'post',
    body: JSON.stringify(linkRequest),
    headers: requestHeaders,
    dataType: 'json',
  });

  const data = await response.json();

  const { shortUrl } = data;
  return shortUrl;
}

function copyShortLink(e) {
  const shortUrl = e.currentTarget.previousElementSibling;
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(shortUrl);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  e.currentTarget.textContent = 'Copied!';
  e.currentTarget.classList.add('copied');
}

function init() {
  const ls = localStorage.getItem('shortLinks');
  shortLinks = JSON.parse(ls);
  shortLinks.forEach(singleLink => {
    const { userLink, shortLink } = singleLink;
    addShortLink(userLink, shortLink);
  });
  const copyBtn = document.querySelectorAll('.copy__btn');
  copyBtn.forEach(btn => btn.addEventListener('click', copyShortLink));
}

init();

linkForm.addEventListener('submit', async e => {
  e.preventDefault();
  link.classList.remove('error');
  errorMsg.classList.remove('visible');
  const userLink = link.value;
  if (userLink.match(urlPattern)) {
    const shortLink = await shortenUrl(userLink);
    await addShortLink(userLink, shortLink);
    const copyBtn = document.querySelectorAll('.copy__btn');
    copyBtn.forEach(btn => btn.addEventListener('click', copyShortLink));
    const shortUrl = {
      userLink,
      shortLink,
    };
    shortLinks.push(shortUrl);
    localStorage.setItem('shortLinks', JSON.stringify(shortLinks));
  } else {
    link.classList.add('error');
    errorMsg.classList.add('visible');
  }
  linkForm.reset();
});
