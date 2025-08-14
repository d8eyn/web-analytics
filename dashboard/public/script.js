(function(){
    const timezones = {"Asia/Barnaul":"RU","Africa/Nouakchott":"MR","Africa/Lusaka":"ZM","Asia/Pyongyang":"KP","Europe/Bratislava":"SK","America/Belize":"BZ","America/Maceio":"BR","Pacific/Chuuk":"FM","Indian/Comoro":"KM","Pacific/Palau":"PW","Asia/Jakarta":"ID","Africa/Windhoek":"NA","America/Chihuahua":"MX","America/Nome":"US","Africa/Mbabane":"SZ","Africa/Porto-Novo":"BJ","Europe/San_Marino":"SM","Pacific/Fakaofo":"TK","America/Denver":"US","Europe/Belgrade":"RS","America/Indiana/Tell_City":"US","America/Fortaleza":"BR","America/Halifax":"CA","Europe/Bucharest":"RO","America/Indiana/Petersburg":"US","Europe/Kirov":"RU","Europe/Athens":"GR","America/Argentina/Ushuaia":"AR","Europe/Monaco":"MC","Europe/Vilnius":"LT","Europe/Copenhagen":"DK","Pacific/Kanton":"KI","America/Caracas":"VE","Asia/Almaty":"KZ","Europe/Paris":"FR","Africa/Blantyre":"MW","Asia/Muscat":"OM","America/North_Dakota/Beulah":"US","America/Matamoros":"MX","Asia/Irkutsk":"RU","America/Costa_Rica":"CR","America/Araguaina":"BR","Atlantic/Canary":"ES","America/Santo_Domingo":"DO","America/Vancouver":"CA","Africa/Addis_Ababa":"ET","Africa/Accra":"GH","Pacific/Kwajalein":"MH","Asia/Baghdad":"IQ","Australia/Adelaide":"AU","Australia/Hobart":"AU","America/Guayaquil":"EC","America/Argentina/Tucuman":"AR","Australia/Lindeman":"AU","America/New_York":"US","Pacific/Fiji":"FJ","America/Antigua":"AG","Africa/Casablanca":"MA","America/Paramaribo":"SR","Africa/Cairo":"EG","America/Cayenne":"GF","America/Detroit":"US","Antarctica/Syowa":"AQ","Africa/Douala":"CM","America/Argentina/La_Rioja":"AR","Africa/Lagos":"NG","America/St_Barthelemy":"BL","Asia/Nicosia":"CY","Asia/Macau":"MO","Europe/Riga":"LV","Asia/Ashgabat":"TM","Indian/Antananarivo":"MG","America/Argentina/San_Juan":"AR","Asia/Aden":"YE","Asia/Tomsk":"RU","America/Asuncion":"PY","Pacific/Bougainville":"PG","Asia/Vientiane":"LA","America/Mazatlan":"MX","Africa/Luanda":"AO","Europe/Oslo":"NO","Africa/Kinshasa":"CD","Europe/Warsaw":"PL","America/Grand_Turk":"TC","Asia/Seoul":"KR","Africa/Tripoli":"LY","America/St_Thomas":"VI","Asia/Kathmandu":"NP","Pacific/Pitcairn":"PN","Pacific/Nauru":"NR","America/Curacao":"CW","Asia/Kabul":"AF","Pacific/Tongatapu":"TO","Europe/Simferopol":"UA","Asia/Ust-Nera":"RU","Africa/Mogadishu":"SO","Indian/Mayotte":"YT","Pacific/Niue":"NU","America/Thunder_Bay":"CA","Atlantic/Azores":"PT","Pacific/Gambier":"PF","Europe/Stockholm":"SE","Africa/Libreville":"GA","America/Punta_Arenas":"CL","America/Guatemala":"GT","America/Noronha":"BR","Europe/Helsinki":"FI","Asia/Gaza":"PS","Pacific/Kosrae":"FM","America/Aruba":"AW","America/Nassau":"BS","Asia/Choibalsan":"MN","America/Winnipeg":"CA","America/Anguilla":"AI","Asia/Thimphu":"BT","Asia/Beirut":"LB","Atlantic/Faroe":"FO","Europe/Berlin":"DE","Europe/Amsterdam":"NL","Pacific/Honolulu":"US","America/Regina":"CA","America/Scoresbysund":"GL","Europe/Vienna":"AT","Europe/Tirane":"AL","Africa/El_Aaiun":"EH","America/Creston":"CA","Asia/Qostanay":"KZ","Asia/Ho_Chi_Minh":"VN","Europe/Samara":"RU","Europe/Rome":"IT","Australia/Eucla":"AU","America/El_Salvador":"SV","America/Chicago":"US","Africa/Abidjan":"CI","Asia/Kamchatka":"RU","Pacific/Tarawa":"KI","America/Santiago":"CL","America/Bahia":"BR","Indian/Christmas":"CX","Asia/Atyrau":"KZ","Asia/Dushanbe":"TJ","Europe/Ulyanovsk":"RU","America/Yellowknife":"CA","America/Recife":"BR","Australia/Sydney":"AU","America/Fort_Nelson":"CA","Pacific/Efate":"VU","Europe/Saratov":"RU","Africa/Banjul":"GM","Asia/Omsk":"RU","Europe/Ljubljana":"SI","Europe/Budapest":"HU","Europe/Astrakhan":"RU","America/Argentina/Buenos_Aires":"AR","Pacific/Chatham":"NZ","America/Argentina/Salta":"AR","Africa/Niamey":"NE","Asia/Pontianak":"ID","Indian/Reunion":"RE","Asia/Hong_Kong":"HK","Antarctica/McMurdo":"AQ","Africa/Malabo":"GQ","America/Los_Angeles":"US","America/Argentina/Cordoba":"AR","Pacific/Pohnpei":"FM","America/Tijuana":"MX","America/Campo_Grande":"BR","America/Dawson_Creek":"CA","Asia/Novosibirsk":"RU","Pacific/Pago_Pago":"AS","Asia/Jerusalem":"IL","Europe/Sarajevo":"BA","Africa/Freetown":"SL","Asia/Yekaterinburg":"RU","America/Juneau":"US","Africa/Ouagadougou":"BF","Africa/Monrovia":"LR","Europe/Kiev":"UA","America/Argentina/San_Luis":"AR","Asia/Tokyo":"JP","Asia/Qatar":"QA","America/La_Paz":"BO","America/Bogota":"CO","America/Thule":"GL","Asia/Manila":"PH","Asia/Hovd":"MN","Asia/Tehran":"IR","Atlantic/Madeira":"PT","America/Metlakatla":"US","Europe/Vatican":"VA","Asia/Bishkek":"KG","Asia/Dili":"TL","Antarctica/Palmer":"AQ","Atlantic/Cape_Verde":"CV","Indian/Chagos":"IO","America/Kentucky/Monticello":"US","Africa/Algiers":"DZ","Africa/Maseru":"LS","Asia/Kuala_Lumpur":"MY","Africa/Khartoum":"SD","America/Argentina/Rio_Gallegos":"AR","America/Blanc-Sablon":"CA","Africa/Maputo":"MZ","America/Tortola":"VG","Atlantic/Bermuda":"BM","America/Argentina/Catamarca":"AR","America/Cayman":"KY","America/Puerto_Rico":"PR","Pacific/Majuro":"MH","Europe/Busingen":"DE","Pacific/Midway":"UM","Indian/Cocos":"CC","Asia/Singapore":"SG","America/Boise":"US","America/Nuuk":"GL","America/Goose_Bay":"CA","Australia/Broken_Hill":"AU","Africa/Dar_es_Salaam":"TZ","Africa/Asmara":"ER","Asia/Samarkand":"UZ","Asia/Tbilisi":"GE","America/Argentina/Jujuy":"AR","America/Indiana/Winamac":"US","America/Porto_Velho":"BR","Asia/Magadan":"RU","Europe/Zaporozhye":"UA","Antarctica/Casey":"AQ","Asia/Shanghai":"CN","Pacific/Norfolk":"NF","Europe/Guernsey":"GG","Australia/Brisbane":"AU","Antarctica/DumontDUrville":"AQ","America/Havana":"CU","America/Atikokan":"CA","America/Mexico_City":"MX","America/Rankin_Inlet":"CA","America/Cuiaba":"BR","America/Resolute":"CA","Africa/Ceuta":"ES","Arctic/Longyearbyen":"SJ","Pacific/Guam":"GU","Asia/Damascus":"SY","Asia/Colombo":"LK","Asia/Yerevan":"AM","America/Montserrat":"MS","America/Belem":"BR","Europe/Kaliningrad":"RU","Atlantic/South_Georgia":"GS","Asia/Tashkent":"UZ","Asia/Kolkata":"IN","America/St_Johns":"CA","Asia/Srednekolymsk":"RU","Asia/Yakutsk":"RU","Europe/Prague":"CZ","Africa/Djibouti":"DJ","Asia/Dubai":"AE","Europe/Uzhgorod":"UA","America/Edmonton":"CA","Asia/Famagusta":"CY","America/Indiana/Knox":"US","Asia/Hebron":"PS","Asia/Taipei":"TW","Europe/London":"GB","Africa/Dakar":"SN","Australia/Darwin":"AU","America/Glace_Bay":"CA","Antarctica/Vostok":"AQ","America/Indiana/Vincennes":"US","America/Nipigon":"CA","Asia/Kuwait":"KW","Pacific/Guadalcanal":"SB","America/Toronto":"CA","Africa/Gaborone":"BW","Africa/Bujumbura":"BI","Africa/Lubumbashi":"CD","America/Merida":"MX","America/Marigot":"MF","Europe/Zagreb":"HR","Pacific/Easter":"CL","America/Santarem":"BR","Pacific/Noumea":"NC","America/Sitka":"US","Atlantic/Stanley":"FK","Pacific/Funafuti":"TV","America/Iqaluit":"CA","America/Rainy_River":"CA","America/Anchorage":"US","America/Lima":"PE","Asia/Baku":"AZ","America/Indiana/Vevay":"US","Asia/Ulaanbaatar":"MN","America/Managua":"NI","Asia/Krasnoyarsk":"RU","Asia/Qyzylorda":"KZ","America/Eirunepe":"BR","Europe/Podgorica":"ME","Europe/Chisinau":"MD","Europe/Mariehamn":"AX","Europe/Volgograd":"RU","Africa/Nairobi":"KE","Europe/Isle_of_Man":"IM","America/Menominee":"US","Africa/Harare":"ZW","Asia/Anadyr":"RU","America/Moncton":"CA","Indian/Maldives":"MV","America/Whitehorse":"CA","Antarctica/Mawson":"AQ","Europe/Madrid":"ES","America/Argentina/Mendoza":"AR","America/Manaus":"BR","Africa/Bangui":"CF","Indian/Mauritius":"MU","Africa/Tunis":"TN","Australia/Lord_Howe":"AU","America/Kentucky/Louisville":"US","America/North_Dakota/Center":"US","Asia/Novokuznetsk":"RU","Asia/Makassar":"ID","America/Port_of_Spain":"TT","America/Bahia_Banderas":"MX","Pacific/Auckland":"NZ","America/Sao_Paulo":"BR","Asia/Dhaka":"BD","America/Pangnirtung":"CA","Europe/Dublin":"IE","Asia/Brunei":"BN","Africa/Brazzaville":"CG","America/Montevideo":"UY","America/Jamaica":"JM","America/Indiana/Indianapolis":"US","America/Kralendijk":"BQ","Europe/Gibraltar":"GI","Pacific/Marquesas":"PF","Pacific/Apia":"WS","Europe/Jersey":"JE","America/Phoenix":"US","Africa/Ndjamena":"TD","Asia/Karachi":"PK","Africa/Kampala":"UG","Asia/Sakhalin":"RU","America/Martinique":"MQ","Europe/Moscow":"RU","Africa/Conakry":"GN","America/Barbados":"BB","Africa/Lome":"TG","America/Ojinaga":"MX","America/Tegucigalpa":"HN","Asia/Bangkok":"TH","Africa/Johannesburg":"ZA","Europe/Vaduz":"LI","Africa/Sao_Tome":"ST","America/Cambridge_Bay":"CA","America/Lower_Princes":"SX","America/Miquelon":"PM","America/St_Kitts":"KN","Australia/Melbourne":"AU","Europe/Minsk":"BY","Asia/Vladivostok":"RU","Europe/Sofia":"BG","Antarctica/Davis":"AQ","Pacific/Galapagos":"EC","America/North_Dakota/New_Salem":"US","Asia/Amman":"JO","Pacific/Wallis":"WF","America/Hermosillo":"MX","Pacific/Kiritimati":"KI","Antarctica/Macquarie":"AU","America/Guyana":"GY","Asia/Riyadh":"SA","Pacific/Tahiti":"PF","America/St_Vincent":"VC","America/Cancun":"MX","America/Grenada":"GD","Pacific/Wake":"UM","America/Dawson":"CA","Europe/Brussels":"BE","Indian/Kerguelen":"TF","America/Yakutat":"US","Indian/Mahe":"SC","Atlantic/Reykjavik":"IS","America/Panama":"PA","America/Guadeloupe":"GP","Europe/Malta":"MT","Antarctica/Troll":"AQ","Asia/Jayapura":"ID","Asia/Bahrain":"BH","Asia/Chita":"RU","Europe/Tallinn":"EE","Asia/Khandyga":"RU","America/Rio_Branco":"BR","Atlantic/St_Helena":"SH","Africa/Juba":"SS","America/Adak":"US","Pacific/Saipan":"MP","America/St_Lucia":"LC","America/Inuvik":"CA","Europe/Luxembourg":"LU","Africa/Bissau":"GW","Asia/Oral":"KZ","America/Boa_Vista":"BR","Europe/Skopje":"MK","America/Port-au-Prince":"HT","Pacific/Port_Moresby":"PG","Europe/Andorra":"AD","America/Indiana/Marengo":"US","Africa/Kigali":"RW","Africa/Bamako":"ML","America/Dominica":"DM","Asia/Aqtobe":"KZ","Europe/Istanbul":"TR","Pacific/Rarotonga":"CK","America/Danmarkshavn":"GL","Europe/Zurich":"CH","Asia/Yangon":"MM","America/Monterrey":"MX","Europe/Lisbon":"PT","Asia/Kuching":"MY","Antarctica/Rothera":"AQ","Australia/Perth":"AU","Asia/Phnom_Penh":"KH","America/Swift_Current":"CA","Asia/Aqtau":"KZ","Asia/Urumqi":"CN","Asia/Calcutta":"IN"};

  const STORAGE_KEY = 'session-id'
  const CLIENT_ID_KEY = 'client-id'
  const VISITOR_ID_KEY = 'visitor-id'
  let DATASOURCE = 'analytics_events'
  const storageMethods = {
    cookie: 'cookie',
    localStorage: 'localStorage',
    sessionStorage: 'sessionStorage',
  }
  let STORAGE_METHOD = storageMethods.cookie
  let globalAttributes = {}
  let stringifyPayload = true
  let pageLoadTime = Date.now()
  let pageStartTime = Date.now()

  let proxy, domain, siteId
  if (document.currentScript) {
    proxy = document.currentScript.getAttribute('data-proxy')
    domain = document.currentScript.getAttribute('data-domain')
    siteId = document.currentScript.getAttribute('data-site-id')
    STORAGE_METHOD = document.currentScript.getAttribute('data-storage') || STORAGE_METHOD
    stringifyPayload = document.currentScript.getAttribute('data-stringify-payload') !== 'false'
    
    // Support custom attributes for additional tracking data
    for (const attr of document.currentScript.attributes) {
      if (attr.name.startsWith('data-custom-')) {
        globalAttributes[attr.name.slice(12)] = attr.value
      }
    }
  }

  /**
   * Generate uuid to identify the session
   */
  function _uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  }

  /**
   * Generate a numeric ID for client/visitor tracking
   */
  function _generateNumericId() {
    return Math.floor(Math.random() * 100000000)
  }

  /**
   * Get or create persistent client ID (survives across sessions)
   */
  function _getClientId() {
    let clientId = localStorage.getItem(CLIENT_ID_KEY)
    if (!clientId) {
      clientId = _generateNumericId()
      localStorage.setItem(CLIENT_ID_KEY, clientId)
    }
    return parseInt(clientId)
  }

  /**
   * Get or create visitor ID (survives for the day)
   */
  function _getVisitorId() {
    const today = new Date().toDateString()
    const key = `${VISITOR_ID_KEY}-${today}`
    let visitorId = sessionStorage.getItem(key)
    if (!visitorId) {
      visitorId = _generateNumericId()
      sessionStorage.setItem(key, visitorId)
    }
    return parseInt(visitorId)
  }

  function _getSessionIdFromCookie() {
    let cookie = {}
    document.cookie.split(';').forEach(function (el) {
      let [key, value] = el.split('=')
      cookie[key.trim()] = value
    })
    return cookie[STORAGE_KEY]
  }

  function _getSessionId() {
    if ([storageMethods.localStorage, storageMethods.sessionStorage].includes(STORAGE_METHOD)) {
      const storage = STORAGE_METHOD === storageMethods.localStorage ? localStorage : sessionStorage
      const serializedItem = storage.getItem(STORAGE_KEY)

      if (!serializedItem) return null

      let item = null
      try {
        item = JSON.parse(serializedItem)
      } catch (error) {
        return null
      }

      if (typeof item !== 'object' || item === null) return null

      const now = new Date()
      if (now.getTime() > item.expiry) {
        storage.removeItem(STORAGE_KEY)
        return null
      }

      return item.value
    }

    return _getSessionIdFromCookie()
  }

  function _setSessionIdFromCookie(sessionId) {
    let cookieValue = `${STORAGE_KEY}=${sessionId}; Max-Age=1800; path=/; secure`
    if (domain) {
      cookieValue += `; domain=${domain}`
    }
    document.cookie = cookieValue
  }

  function _setSessionId() {
    const sessionId = _getSessionId() || _uuidv4()
    if ([storageMethods.localStorage, storageMethods.sessionStorage].includes(STORAGE_METHOD)) {
      const now = new Date()
      const item = {
        value: sessionId,
        expiry: now.getTime() + 1800 * 1000,
      }
      const value = JSON.stringify(item)
      const storage = STORAGE_METHOD === storageMethods.localStorage ? localStorage : sessionStorage
      storage.setItem(STORAGE_KEY, value)
    } else {
      _setSessionIdFromCookie(sessionId)
    }
    return sessionId
  }

  /**
   * Parse UTM parameters from URL
   */
  function _getUtmParams() {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || ''
    }
  }

  /**
   * Detect device type and mobile/desktop flags
   */
  function _getDeviceInfo() {
    const ua = navigator.userAgent.toLowerCase()
    let device = 'desktop'
    let mobile = 0
    let desktop = 1

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/.test(ua)) {
      device = 'tablet'
      mobile = 0
      desktop = 0
    } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(ua)) {
      device = 'mobile'
      mobile = 1
      desktop = 0
    }

    return { device, mobile, desktop }
  }

  /**
   * Detect browser and OS from user agent
   */
  function _getBrowserInfo() {
    const ua = navigator.userAgent
    let browser = 'Unknown'
    let os = 'Unknown'
    let browser_version = ''
    let os_version = ''

    // Browser detection with version
    if (ua.includes('Edg/')) {
      browser = 'Edge'
      const match = ua.match(/Edg\/([0-9.]+)/)
      browser_version = match ? match[1] : ''
    } else if (ua.includes('Firefox/')) {
      browser = 'Firefox'
      const match = ua.match(/Firefox\/([0-9.]+)/)
      browser_version = match ? match[1] : ''
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
      browser = 'Chrome'
      const match = ua.match(/Chrome\/([0-9.]+)/)
      browser_version = match ? match[1] : ''
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
      browser = 'Safari'
      const match = ua.match(/Version\/([0-9.]+)/)
      browser_version = match ? match[1] : ''
    } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
      browser = 'Opera'
      const match = ua.match(/(?:Opera|OPR)\/([0-9.]+)/)
      browser_version = match ? match[1] : ''
    }

    // OS detection with version
    if (ua.includes('Windows NT 10.0')) {
      os = 'Windows'
      os_version = '10'
    } else if (ua.includes('Windows NT 6.3')) {
      os = 'Windows'
      os_version = '8.1'
    } else if (ua.includes('Windows NT 6.1')) {
      os = 'Windows'
      os_version = '7'
    } else if (ua.includes('Windows')) {
      os = 'Windows'
    } else if (ua.includes('Mac OS X')) {
      os = 'macOS'
      const match = ua.match(/Mac OS X ([0-9_]+)/)
      os_version = match ? match[1].replace(/_/g, '.') : ''
    } else if (ua.includes('Android')) {
      os = 'Android'
      const match = ua.match(/Android ([0-9.]+)/)
      os_version = match ? match[1] : ''
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS'
      const match = ua.match(/OS ([0-9_]+)/)
      os_version = match ? match[1].replace(/_/g, '.') : ''
    } else if (ua.includes('Linux')) {
      os = 'Linux'
    }

    return { browser, os, browser_version, os_version }
  }

  /**
   * Get screen class based on viewport
   */
  function _getScreenClass() {
    const width = window.innerWidth || document.documentElement.clientWidth
    if (width < 768) return 'mobile'
    else if (width < 1024) return 'tablet'
    else if (width < 1920) return 'desktop'
    else return 'large-desktop'
  }

  /**
   * Classify traffic source
   */
  function _getTrafficChannel(referrer, utmSource) {
    if (utmSource) return 'Campaign'
    if (!referrer) return 'Direct'
    
    const domain = referrer.toLowerCase()
    if (domain.includes('google') || domain.includes('bing') || domain.includes('yahoo') || 
        domain.includes('duckduckgo') || domain.includes('yandex') || domain.includes('baidu')) return 'Search'
    if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('linkedin') || 
        domain.includes('instagram') || domain.includes('youtube') || domain.includes('tiktok') ||
        domain.includes('snapchat') || domain.includes('pinterest') || domain.includes('reddit')) return 'Social'
    if (domain.includes('mail') || domain.includes('gmail') || domain.includes('outlook')) return 'Email'
    
    return 'Referral'
  }

  /**
   * Get referrer information
   */
  function _getReferrerInfo(referrer) {
    if (!referrer) return { referrer_name: '', referrer_icon: '' }
    
    const domain = referrer.toLowerCase()
    
    if (domain.includes('google')) return { referrer_name: 'Google', referrer_icon: 'google.png' }
    if (domain.includes('facebook')) return { referrer_name: 'Facebook', referrer_icon: 'facebook.png' }
    if (domain.includes('twitter')) return { referrer_name: 'Twitter', referrer_icon: 'twitter.png' }
    if (domain.includes('linkedin')) return { referrer_name: 'LinkedIn', referrer_icon: 'linkedin.png' }
    if (domain.includes('bing')) return { referrer_name: 'Bing', referrer_icon: 'bing.png' }
    if (domain.includes('yahoo')) return { referrer_name: 'Yahoo', referrer_icon: 'yahoo.png' }
    if (domain.includes('reddit')) return { referrer_name: 'Reddit', referrer_icon: 'reddit.png' }
    if (domain.includes('youtube')) return { referrer_name: 'YouTube', referrer_icon: 'youtube.png' }
    
    return { referrer_name: '', referrer_icon: '' }
  }

  /**
   * Simple bot detection
   */
  function _detectBot(userAgent) {
    const ua = userAgent.toLowerCase()
    const botPatterns = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
      'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegram',
      'bot', 'crawler', 'spider', 'scraper', 'wget', 'curl', 'ahrefsbot'
    ]
    
    for (const pattern of botPatterns) {
      if (ua.includes(pattern)) {
        return { bot: 1, bot_reason: pattern.charAt(0).toUpperCase() + pattern.slice(1) }
      }
    }
    
    if (userAgent.length < 10) {
      return { bot: 1, bot_reason: 'Short User Agent' }
    }
    
    if (!userAgent) {
      return { bot: 1, bot_reason: 'Empty User Agent' }
    }
    
    return { bot: 0, bot_reason: '' }
  }

  /**
   * Try to mask PPI and potential sensible attributes
   */
  const _maskSuspiciousAttributes = payload => {
    const attributesToMask = [
      'username', 'user', 'user_id', 'userid', 'password', 'pass', 'pin', 
      'passcode', 'token', 'api_token', 'email', 'address', 'phone', 
      'sex', 'gender', 'order', 'order_id', 'orderid', 'payment', 'credit_card',
    ]

    let _payload = JSON.stringify(payload)
    attributesToMask.forEach(attr => {
      _payload = _payload.replaceAll(
        new RegExp(`("${attr}"):(".+?"|\\d+)`, 'mgi'),
        '$1:"********"'
      )
    })

    return _payload
  }

  /**
   * Send event to endpoint with comprehensive tracking data
   */
  async function _sendEvent(name, payload = {}, customData = {}) {
    _setSessionId()
    let url

    // Always use this project's API endpoint
    if (proxy) {
      // Remove trailing slashes from proxy URL
      proxy = proxy.replace(/\/+$/, '')
      url = `${proxy}/api/track`
    } else {
      // Default to current domain if no proxy specified
      url = `${window.location.origin}/api/track`
    }

    // Get comprehensive tracking data
    let country, locale
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      country = timezones[timezone] || ''
      locale = navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en'
    } catch (error) {
      country = ''
      locale = 'en'
    }

    const utmParams = _getUtmParams()
    const deviceInfo = _getDeviceInfo()
    const browserInfo = _getBrowserInfo()
    const referrerInfo = _getReferrerInfo(document.referrer)
    const botInfo = _detectBot(navigator.userAgent)
    const sessionId = _getSessionId() || _uuidv4()

    // Calculate duration if this is a page navigation
    const currentTime = Date.now()
    const duration_seconds = name === 'page_hit' ? Math.floor((currentTime - pageStartTime) / 1000) : 0

    // Build comprehensive event data matching the new schema
    const eventData = {
      timestamp: new Date().toISOString(),
      action: name,
      version: '1',
      session_id: sessionId,
      client_id: _getClientId(),
      visitor_id: _getVisitorId(),
      site_id: siteId || null,
      hostname: window.location.hostname,
      path: window.location.pathname,
      title: document.title || '',
      language: locale,
      country_code: country,
      region: '', // Could be enhanced with geolocation API
      city: '', // Could be enhanced with geolocation API
      referrer: document.referrer || '',
      ...referrerInfo,
      os: browserInfo.os,
      os_version: browserInfo.os_version,
      browser: browserInfo.browser,
      browser_version: browserInfo.browser_version,
      desktop: deviceInfo.desktop,
      mobile: deviceInfo.mobile,
      screen_class: _getScreenClass(),
      ...utmParams,
      channel: _getTrafficChannel(document.referrer, utmParams.utm_source),
      duration_seconds: duration_seconds,
      user_agent: navigator.userAgent,
      ip: '', // Server-side should populate this
      ...botInfo,
      ...customData
    }

    // Add payload as before for backward compatibility
    if (stringifyPayload) {
      const processedPayload = _maskSuspiciousAttributes({...payload, ...globalAttributes})
      eventData.payload = processedPayload
    } else {
      eventData.payload = {...payload, ...globalAttributes}
    }

    const request = new XMLHttpRequest()
    request.open('POST', url, true)
    request.setRequestHeader('Content-Type', 'application/json')
    request.send(JSON.stringify(eventData))

    // Reset page start time for duration tracking
    if (name === 'page_hit') {
      pageStartTime = currentTime
    }
  }

  /**
   * Track page hit with comprehensive data
   */
  function _trackPageHit() {
    // Skip in test environments
    if (window.__nightmare || window.navigator.webdriver || window.Cypress) return

    setTimeout(() => {
      _sendEvent('page_hit', {
        href: window.location.href
      }, {
        // Page hits don't have event metadata, but we need to send empty arrays for compatibility
        event_meta_keys: [],
        event_meta_values: [],
        event_meta_types: [],
        tag_keys: [],
        tag_values: [],
        tag_types: []
      })
    }, 300)
  }

  /**
   * Track custom events with metadata
   * Handles multi-type values by converting them to strings while preserving structure
   * Includes type hints for dynamic querying
   */
  function _trackCustomEvent(eventName, eventData = {}) {
    const metaKeys = Object.keys(eventData)
    const metaValues = []
    const metaTypes = []
    
    Object.values(eventData).forEach(value => {
      // Detect type and convert to string while preserving type information
      if (value === null || value === undefined) {
        metaValues.push('')
        metaTypes.push('null')
      } else if (Array.isArray(value)) {
        metaValues.push(JSON.stringify(value))
        metaTypes.push('array')
      } else if (typeof value === 'object') {
        metaValues.push(JSON.stringify(value))
        metaTypes.push('object')
      } else if (typeof value === 'number') {
        metaValues.push(String(value))
        metaTypes.push(Number.isInteger(value) ? 'integer' : 'float')
      } else if (typeof value === 'boolean') {
        metaValues.push(String(value))
        metaTypes.push('boolean')
      } else {
        metaValues.push(String(value))
        metaTypes.push('string')
      }
    })
    
    _sendEvent('custom_event', eventData, {
      event_name: eventName,
      event_meta_keys: metaKeys,
      event_meta_values: metaValues,
      event_meta_types: metaTypes  // New field for type hints
    })
  }

  /**
   * Track page tagging
   * Handles multi-type values by converting them to strings while preserving structure
   * Includes type hints for dynamic querying
   */
  function _trackPageTags(tags = {}) {
    const tagKeys = Object.keys(tags)
    const tagValues = []
    const tagTypes = []
    
    Object.values(tags).forEach(value => {
      // Detect type and convert to string while preserving type information
      if (value === null || value === undefined) {
        tagValues.push('')
        tagTypes.push('null')
      } else if (Array.isArray(value)) {
        tagValues.push(JSON.stringify(value))
        tagTypes.push('array')
      } else if (typeof value === 'object') {
        tagValues.push(JSON.stringify(value))
        tagTypes.push('object')
      } else if (typeof value === 'number') {
        tagValues.push(String(value))
        tagTypes.push(Number.isInteger(value) ? 'integer' : 'float')
      } else if (typeof value === 'boolean') {
        tagValues.push(String(value))
        tagTypes.push('boolean')
      } else {
        tagValues.push(String(value))
        tagTypes.push('string')
      }
    })
    
    _sendEvent('page_hit', {
      href: window.location.href
    }, {
      tag_keys: tagKeys,
      tag_values: tagValues,
      tag_types: tagTypes  // New field for type hints
    })
  }

  // Enhanced Client API
  window.UMNTR = { 
    // Main tracking functions
    trackEvent: _trackCustomEvent,
    trackPageHit: _trackPageHit,
    trackPageTags: _trackPageTags,
    
    // Utility functions
    getClientId: _getClientId,
    getVisitorId: _getVisitorId,
    getSessionId: _getSessionId
  }

  // Event listeners for navigation
  window.addEventListener('hashchange', _trackPageHit)
  const his = window.history
  if (his.pushState) {
    const originalPushState = his['pushState']
    his.pushState = function () {
      originalPushState.apply(this, arguments)
      _trackPageHit()
    }
    window.addEventListener('popstate', _trackPageHit)
  }

  let lastPage
  function handleVisibilityChange() {
    if (!lastPage && document.visibilityState === 'visible') {
      _trackPageHit()
    }
  }

  if (document.visibilityState === 'prerender') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  } else {
    _trackPageHit()
  }
})()
