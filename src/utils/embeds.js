const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { DateTime } = require('luxon');

// Comprehensive mapping of FIFA country abbreviations to Unicode flag emojis
const FIFA_FLAGS = {
    // UEFA
    'ALB': '🇦🇱', 'AND': '🇦🇩', 'ARM': '🇦🇲', 'AUT': '🇦🇹', 'AZE': '🇦🇿',
    'BEL': '🇧🇪', 'BIH': '🇧🇦', 'BLR': '🇧🇾', 'BUL': '🇧🇬', 'CRO': '🇭🇷',
    'CYP': '🇨🇾', 'CZE': '🇨🇿', 'DEN': '🇩🇰', 'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ESP': '🇪🇸',
    'EST': '🇪🇪', 'FIN': '🇫🇮', 'FRA': '🇫🇷', 'GEO': '🇬🇪', 'GER': '🇩🇪',
    'GIB': '🇬🇮', 'GRE': '🇬🇷', 'HUN': '🇭🇺', 'IRL': '🇮🇪', 'ISL': '🇮🇸',
    'ISR': '🇮🇱', 'ITA': '🇮🇹', 'KAZ': '🇰🇿', 'LIE': '🇱🇮', 'LTU': '🇱🇹',
    'LUX': '🇱🇺', 'LVA': '🇱🇻', 'MDA': '🇲🇩', 'MKD': '🇲🇰', 'MLT': '🇲🇹',
    'MNE': '🇲🇪', 'NED': '🇳🇱', 'NIR': '🏴󠁧󠁢󠁮󠁧󠁿',
    'NOR': '🇳🇴', 'POL': '🇵🇱', 'POR': '🇵🇹', 'ROU': '🇷🇴', 'RUS': '🇷🇺',
    'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'SMR': '🇸🇲', 'SRB': '🇷🇸', 'SUI': '🇨🇭', 'SVK': '🇸🇰',
    'SVN': '🇸🇮', 'SWE': '🇸🇪', 'TUR': '🇹🇷', 'UKR': '🇺🇦', 'WAL': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    // CONMEBOL
    'ARG': '🇦🇷', 'BOL': '🇧🇴', 'BRA': '🇧🇷', 'CHI': '🇨🇱', 'COL': '🇨🇴',
    'ECU': '🇪🇨', 'PAR': '🇵🇾', 'PER': '🇵🇪', 'URU': '🇺🇾', 'VEN': '🇻🇪',
    // CONCACAF
    'AIA': '🇦🇮', 'ATG': '🇦🇬', 'ARU': '🇦🇼', 'BAH': '🇧🇸', 'BRB': '🇧🇧',
    'BLZ': '🇧🇿', 'BER': '🇧🇲', 'VGB': '🇻🇬', 'CAN': '🇨🇦', 'KYM': '🇰🇾',
    'CRC': '🇨🇷', 'CUB': '🇨🇺', 'CUW': '🇨🇼', 'DMA': '🇩🇲', 'DOM': '🇩🇴',
    'SLV': '🇸🇻', 'GRN': '🇬🇩', 'GUA': '🇬🇹', 'GUY': '🇬🇾', 'HAI': '🇭🇹',
    'HON': '🇭🇳', 'JAM': '🇯🇲', 'MEX': '🇲🇽', 'MSR': '🇲🇸', 'NCA': '🇳🇮',
    'PAN': '🇵🇦', 'PUR': '🇵🇷', 'SKN': '🇰🇳', 'LCA': '🇱🇨', 'SMN': '🇲🇫',
    'VIN': '🇻🇨', 'SUR': '🇸🇷', 'TRI': '🇹🇹', 'TCA': '🇹🇨', 'USA': '🇺🇸',
    'VIR': '🇻🇮',
    // CAF
    'ALG': '🇩🇿', 'ANG': '🇦🇴', 'BEN': '🇧🇯', 'BOT': '🇧🇼', 'BFA': '🇧🇫',
    'BDI': '🇧🇮', 'CPV': '🇨🇻', 'CMR': '🇨🇲', 'CAF': '🇨🇫', 'CHA': '🇹🇩',
    'COM': '🇰🇲', 'CGO': '🇨🇬', 'COD': '🇨🇩', 'CIV': '🇨🇮', 'DJI': '🇩🇯',
    'EGY': '🇪🇬', 'GNQ': '🇬🇶', 'ERI': '🇪🇷', 'SWZ': '🇸🇿', 'ETH': '🇪🇹',
    'GAB': '🇬🇦', 'GAM': '🇬🇲', 'GHA': '🇬🇭', 'GIN': '🇬🇳', 'GNB': '🇬🇼',
    'KEN': '🇰🇪', 'LES': '🇱🇸', 'LBR': '🇱🇷', 'LBY': '🇱🇾', 'MAD': '🇲🇬',
    'MWI': '🇲🇼', 'MLI': '🇲🇱', 'MTN': '🇲🇷', 'MRI': '🇲🇺', 'MAR': '🇲🇦',
    'MOZ': '🇲🇿', 'NAM': '🇳🇦', 'NIG': '🇳🇪', 'NGA': '🇳🇬', 'RWA': '🇷🇼',
    'STP': '🇸🇹', 'SEN': '🇸🇳', 'SEY': '🇸🇨', 'SLE': '🇸🇱', 'SOM': '🇸🇴',
    'RSA': '🇿🇦', 'SSD': '🇸🇸', 'SUD': '🇸🇩', 'TAN': '🇹🇿', 'TOG': '🇹🇬',
    'TUN': '🇹🇳', 'UGA': '🇺🇬', 'ZAM': '🇿🇲', 'ZIM': '🇿🇼',
    // AFC
    'AFG': '🇦🇫', 'AUS': '🇦🇺', 'BRN': '🇧🇭', 'BAN': '🇧🇩', 'BHU': '🇧🇹',
    'BRU': '🇧🇳', 'CAM': '🇰🇭', 'CHN': '🇨🇳', 'GUM': '🇬🇺', 'HKG': '🇭🇰',
    'IND': '🇮🇳', 'IDN': '🇮🇩', 'IRN': '🇮🇷', 'IRQ': '🇮🇶', 'JPN': '🇯🇵',
    'JOR': '🇯🇴', 'KOR': '🇰🇷', 'KUW': '🇰🇼', 'KGZ': '🇰🇬', 'LAO': '🇱🇦',
    'LBN': '🇱🇧', 'MAC': '🇲🇴', 'MAS': '🇲🇾', 'MDV': '🇲🇻', 'MGL': '🇲🇳',
    'MYA': '🇲🇲', 'NEP': '🇳🇵', 'OMA': '🇴🇲', 'PAK': '🇵🇰', 'PLE': '🇵🇸',
    'PHI': '🇵🇭', 'QAT': '🇶🇦', 'KSA': '🇸🇦', 'SGP': '🇸🇬', 'SRI': '🇱🇰',
    'SYR': '🇸🇾', 'TJK': '🇹🇯', 'THA': '🇹🇭', 'TLS': '🇹🇱', 'TKM': '🇹🇲',
    'UAE': '🇦🇪', 'UZB': '🇺🇿', 'VIE': '🇻🇳', 'YEM': '🇾🇪',
    // OFC
    'ASA': '🇦🇸', 'COK': '🇨🇰', 'FIJ': '🇫🇮', 'NCL': '🇳🇨', 'NZL': '🇳🇿',
    'PNG': '🇵🇬', 'SAM': '🇼🇸', 'SOL': '🇸🇧', 'TAH': '🇵🇫', 'TGA': '🇹🇴',
    'VAN': '🇻🇺'
};

// Mapping of country name keywords to flag emojis for full name resolution
const COUNTRY_NAME_FLAGS = {
    'qatar': '🇶🇦', 'ecuador': '🇪🇨', 'senegal': '🇸🇳', 'netherlands': '🇳🇱',
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'iran': '🇮🇷', 'usa': '🇺🇸', 'united states': '🇺🇸', 'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'argentina': '🇦🇷', 'saudi arabia': '🇸🇦', 'mexico': '🇲🇽', 'poland': '🇵🇱',
    'france': '🇫🇷', 'australia': '🇦🇺', 'denmark': '🇩🇰', 'tunisia': '🇹🇳',
    'spain': '🇪🇸', 'costa rica': '🇨🇷', 'germany': '🇩🇪', 'japan': '🇯🇵',
    'belgium': '🇧🇪', 'canada': '🇨🇦', 'morocco': '🇲🇦', 'croatia': '🇭🇷',
    'brazil': '🇧🇷', 'serbia': '🇷🇸', 'switzerland': '🇨🇭', 'cameroon': '🇨🇲',
    'portugal': '🇵🇹', 'ghana': '🇬🇭', 'uruguay': '🇺🇾', 'south korea': '🇰🇷', 'korea republic': '🇰🇷',
    'italy': '🇮🇹', 'colombia': '🇨🇴', 'sweden': '🇸🇪', 'chile': '🇨🇱', 'peru': '🇵🇪',
    'ukraine': '🇺🇦', 'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'czechia': '🇨🇿', 'czech republic': '🇨🇿',
    'turkey': '🇹🇷', 'türkiye': '🇹🇷', 'egypt': '🇪🇬', 'algeria': '🇩🇿', 'nigeria': '🇳🇬',
    'south africa': '🇿🇦', 'austria': '🇦🇹', 'hungary': '🇭🇺', 'norway': '🇳🇴',
    'greece': '🇬🇷', 'romania': '🇷🇴', 'slovakia': '🇸🇰', 'finland': '🇫🇮',
    'ireland': '🇮🇪', 'northern ireland': '🏴󠁧󠁢󠁮󠁧󠁿', 'bosnia': '🇧🇦', 'haiti': '🇭🇹',
    'ivory coast': '🇨🇮', 'cote d\'ivoire': '🇨🇮'
};

// English to Vietnamese translation for common teams
const TEAM_NAMES_VI = {
    'united states': 'Mỹ',
    'usa': 'Mỹ',
    'mexico': 'Mexico',
    'canada': 'Canada',
    'argentina': 'Argentina',
    'brazil': 'Brazil',
    'france': 'Pháp',
    'england': 'Anh',
    'spain': 'Tây Ban Nha',
    'germany': 'Đức',
    'italy': 'Ý',
    'netherlands': 'Hà Lan',
    'portugal': 'Bồ Đào Nha',
    'belgium': 'Bỉ',
    'croatia': 'Croatia',
    'morocco': 'Ma-rốc',
    'japan': 'Nhật Bản',
    'south korea': 'Hàn Quốc',
    'korea republic': 'Hàn Quốc',
    'saudi arabia': 'Ả Rập Xê-út',
    'australia': 'Úc',
    'iran': 'Iran',
    'senegal': 'Senegal',
    'ecuador': 'Ecuador',
    'qatar': 'Qatar',
    'wales': 'Xứ Wales',
    'poland': 'Ba Lan',
    'denmark': 'Đan Mạch',
    'tunisia': 'Tunisia',
    'costa rica': 'Costa Rica',
    'switzerland': 'Thụy Sĩ',
    'cameroon': 'Cameroon',
    'ghana': 'Ghana',
    'uruguay': 'Uruguay',
    'colombia': 'Colombia',
    'sweden': 'Thụy Điển',
    'chile': 'Chile',
    'peru': 'Peru',
    'ukraine': 'Ukraina',
    'scotland': 'Scotland',
    'czechia': 'Cộng hòa Séc',
    'czech republic': 'Cộng hòa Séc',
    'turkey': 'Thổ Nhĩ Kỳ',
    'türkiye': 'Thổ Nhĩ Kỳ',
    'egypt': 'Ai Cập',
    'algeria': 'Algeria',
    'nigeria': 'Nigeria',
    'south africa': 'Nam Phi',
    'austria': 'Áo',
    'hungary': 'Hungary',
    'norway': 'Na Uy',
    'greece': 'Hy Lạp',
    'romania': 'Rumani',
    'slovakia': 'Slovakia',
    'finland': 'Phần Lan',
    'ireland': 'Ireland',
    'northern ireland': 'Bắc Ireland',
    'bosnia': 'Bosnia',
    'haiti': 'Haiti',
    'ivory coast': 'Bờ Biển Ngà',
    'cote d\'ivoire': 'Bờ Biển Ngà',
    'vietnam': 'Việt Nam',
    'viet nam': 'Việt Nam',
    'new zealand': 'New Zealand',
    'panama': 'Panama',
    'russia': 'Nga',
    'venezuela': 'Venezuela',
    'bolivia': 'Bolivia',
    'paraguay': 'Paraguay',
    'jamaica': 'Jamaica',
    'honduras': 'Honduras',
    'el salvador': 'El Salvador',
    'china': 'Trung Quốc',
    'iraq': 'Iraq',
    'uzbekistan': 'Uzbekistan',
    'united arab emirates': 'UAE',
    'uae': 'UAE',
    'oman': 'Oman',
    'jordan': 'Jordan',
    'bahrain': 'Bahrain',
    'syria': 'Syria',
    'palestine': 'Palestine',
    'thailand': 'Thái Lan',
    'indonesia': 'Indonesia',
    'malaysia': 'Malaysia',
    'singapore': 'Singapore',
    'philippines': 'Philippines',
};

// Match status translations
const STATUS_VI = {
    'scheduled': 'Chưa bắt đầu',
    'pre': 'Sắp diễn ra',
    'in': 'Đang trực tiếp',
    'post': 'Đã kết thúc',
    'final': 'Hết giờ',
    'full time': 'Hết giờ',
    'ft': 'Hết giờ',
    'halftime': 'Nghỉ giữa giờ',
    'ht': 'Nghỉ giữa giờ',
    'first half': 'Hiệp 1',
    '1st half': 'Hiệp 1',
    'second half': 'Hiệp 2',
    '2nd half': 'Hiệp 2',
    'delayed': 'Tạm hoãn',
    'suspended': 'Tạm dừng',
    'postponed': 'Hoãn lịch',
    'canceled': 'Hủy bỏ',
    'end of period': 'Hết hiệp',
    'overtime': 'Hiệp phụ',
    'ot': 'Hiệp phụ',
    'shootout': 'Luân lưu',
    'penalties': 'Đá luân lưu',
    'pen': 'Luân lưu',
};

// Stages translations
const STAGE_VI = {
    'group a': 'Bảng A',
    'group b': 'Bảng B',
    'group c': 'Bảng C',
    'group d': 'Bảng D',
    'group e': 'Bảng E',
    'group f': 'Bảng F',
    'group g': 'Bảng G',
    'group h': 'Bảng H',
    'group i': 'Bảng I',
    'group j': 'Bảng J',
    'group k': 'Bảng K',
    'group l': 'Bảng L',
    'round of 32': 'Vòng 32 đội',
    'round of 16': 'Vòng 1/8 (16 đội)',
    'quarter-finals': 'Vòng Tứ kết',
    'quarterfinal': 'Vòng Tứ kết',
    'quarterfinals': 'Vòng Tứ kết',
    'semi-finals': 'Vòng Bán kết',
    'semifinal': 'Vòng Bán kết',
    'semifinals': 'Vòng Bán kết',
    'third place': 'Trận tranh Hạng ba',
    '3rd place play-off': 'Trận tranh Hạng ba',
    'final': 'Trận Chung kết',
    'play-offs': 'Vòng Play-off',
};

/**
 * Translates team name to Vietnamese if mapped.
 */
function translateTeam(name) {
    if (!name) return '';
    const key = name.toLowerCase().trim();
    if (TEAM_NAMES_VI[key]) return TEAM_NAMES_VI[key];
    for (const [eng, vi] of Object.entries(TEAM_NAMES_VI)) {
        if (key === eng || key.includes(eng)) {
            return vi;
        }
    }
    return name;
}

/**
 * Translates match status to Vietnamese.
 */
function translateStatus(statusStr) {
    if (!statusStr) return '—';
    const key = statusStr.toLowerCase().trim();
    if (STATUS_VI[key]) return STATUS_VI[key];
    for (const [eng, vi] of Object.entries(STATUS_VI)) {
        if (key.includes(eng)) return vi;
    }
    return statusStr;
}

/**
 * Translates stage info to Vietnamese.
 */
function translateStage(stageStr) {
    if (!stageStr) return 'FIFA World Cup';
    const key = stageStr.toLowerCase().trim();
    if (STAGE_VI[key]) return STAGE_VI[key];
    for (const [eng, vi] of Object.entries(STAGE_VI)) {
        if (key.includes(eng)) return vi;
    }
    return stageStr;
}

/**
 * Returns the Unicode flag emoji for a team abbreviation.
 */
function getFlag(abbreviation) {
    if (!abbreviation) return '⚽';
    const key = abbreviation.toUpperCase();
    return FIFA_FLAGS[key] || '⚽';
}

/**
 * Resolves a full country name (e.g. from The Odds API) to a flag emoji.
 */
function getFlagByName(name) {
    if (!name) return '⚽';
    const key = name.toLowerCase().trim();
    for (const [country, flag] of Object.entries(COUNTRY_NAME_FLAGS)) {
        if (key.includes(country)) {
            return flag;
        }
    }
    return '⚽';
}

/**
 * Formats a single match's betting lines (H2H, spreads, totals) as text.
 */
function getOddsText(event) {
    if (!event.bookmakers || event.bookmakers.length === 0) {
        return '❌ Không có tỷ lệ kèo từ nhà cái.';
    }
    
    const bookmaker = event.bookmakers.find(b => b.markets.length > 0) || event.bookmakers[0];
    
    const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
    const spreadsMarket = bookmaker.markets.find(m => m.key === 'spreads');
    const totalsMarket = bookmaker.markets.find(m => m.key === 'totals');
    
    let lines = [];
    lines.push(`🎯 **Nhà cái:** \`${bookmaker.title}\``);
    
    const name1 = translateTeam(event.home_team);
    const name2 = translateTeam(event.away_team);

    // 1. Head-to-Head (H2H)
    if (h2hMarket) {
        const homeOutcome = h2hMarket.outcomes.find(o => o.name === event.home_team);
        const awayOutcome = h2hMarket.outcomes.find(o => o.name === event.away_team);
        const drawOutcome = h2hMarket.outcomes.find(o => o.name === 'Draw');
        
        const homeOdds = homeOutcome ? homeOutcome.price.toFixed(2) : 'N/A';
        const awayOdds = awayOutcome ? awayOutcome.price.toFixed(2) : 'N/A';
        const drawOdds = drawOutcome ? drawOutcome.price.toFixed(2) : 'N/A';
        
        lines.push(`💵 **Kèo Châu Âu (1X2):**\n  • **${name1}** thắng: **${homeOdds}**\n  • **${name2}** thắng: **${awayOdds}**\n  • Hòa: **${drawOdds}**`);
    } else {
        lines.push(`💵 **Kèo Châu Âu (1X2):** Không có sẵn`);
    }
    
    // 2. Point Spreads / Handicap
    if (spreadsMarket) {
        const homeOutcome = spreadsMarket.outcomes.find(o => o.name === event.home_team);
        const awayOutcome = spreadsMarket.outcomes.find(o => o.name === event.away_team);
        
        const homeLine = homeOutcome ? `${homeOutcome.point > 0 ? '+' : ''}${homeOutcome.point} (${homeOutcome.price.toFixed(2)})` : 'N/A';
        const awayLine = awayOutcome ? `${awayOutcome.point > 0 ? '+' : ''}${awayOutcome.point} (${awayOutcome.price.toFixed(2)})` : 'N/A';
        
        lines.push(`📐 **Kèo Chấp (Handicap):**\n  • **${name1}** chấp: **${homeLine}**\n  • **${name2}** chấp: **${awayLine}**`);
    }
    
    // 3. Over/Under Totals
    if (totalsMarket) {
        const overOutcome = totalsMarket.outcomes.find(o => o.name === 'Over');
        const underOutcome = totalsMarket.outcomes.find(o => o.name === 'Under');
        
        const point = overOutcome ? overOutcome.point : (underOutcome ? underOutcome.point : '2.5');
        const overOdds = overOutcome ? overOutcome.price.toFixed(2) : 'N/A';
        const underOdds = underOutcome ? underOutcome.price.toFixed(2) : 'N/A';
        
        lines.push(`📊 **Kèo Tài Xỉu (O/U ${point}):**\n  • Tài (Over): **${overOdds}**\n  • Xỉu (Under): **${underOdds}**`);
    }
    
    return lines.join('\n');
}

/**
 * Creates a beautiful detailed embed for a match.
 * @param {Object} event - The ESPN match event object.
 * @param {string} [tz] - User timezone (defaults to UTC).
 */
function createMatchEmbed(event, tz = 'UTC') {
    const competition = event.competitions[0];
    const status = event.status.type.shortDetail;
    const state = event.status.type.state;
    const isLive = state === 'in';
    const isFinished = state === 'post';
    
    const team1 = competition.competitors[0];
    const team2 = competition.competitors[1];

    const flag1 = getFlag(team1.team.abbreviation);
    const flag2 = getFlag(team2.team.abbreviation);
    const name1 = translateTeam(team1.team.displayName);
    const name2 = translateTeam(team2.team.displayName);

    let color = 0x10B981; // Premium Emerald Green for upcoming
    let statusPrefix = '📅 SẮP DIỄN RA:';
    if (isLive) {
        color = 0xEF4444; // Vibrant Crimson Red for live
        statusPrefix = '🔴 TRỰC TIẾP:';
    } else if (isFinished) {
        color = 0x64748B; // Sleek Slate Gray for finished
        statusPrefix = '🏁 KẾT THÚC:';
    }

    const embed = new EmbedBuilder()
        .setTitle(`${statusPrefix} ${name1} vs ${name2}`)
        .setURL(event.links?.[0]?.href || null)
        .setColor(color)
        .setThumbnail(team1.team.logo || team2.team.logo || null)
        .setTimestamp(new Date(competition.date));

    let scoreText = 'vs';
    if (isLive || isFinished) {
        scoreText = `**${team1.score}** - **${team2.score}**`;
    }
    
    embed.setDescription(
        `### ${flag1} **${name1}**  ${scoreText}  **${name2}** ${flag2}`
    );

    const getScorersText = (teamId) => {
        if (!competition.details) return '—';
        const scorers = competition.details
            .filter(d => d.scoringPlay && d.team?.id === teamId)
            .map(d => {
                const player = d.athletesInvolved?.[0]?.displayName || 'Cầu thủ';
                const minute = d.clock?.displayValue || '';
                let suffix = '';
                if (d.penaltyKick) suffix = ' (phạt đền)';
                else if (d.ownGoal) suffix = ' (phản lưới nhà)';
                return `⚽ ${player} (${minute})${suffix}`;
            });
        return scorers.length > 0 ? scorers.join('\n') : '—';
    };

    if (isLive || isFinished) {
        const t1Scorers = getScorersText(team1.team.id);
        const t2Scorers = getScorersText(team2.team.id);
        
        if (t1Scorers !== '—' || t2Scorers !== '—') {
            embed.addFields(
                { name: `⚽ Ghi bàn (${name1})`, value: t1Scorers, inline: true },
                { name: `⚽ Ghi bàn (${name2})`, value: t2Scorers, inline: true }
            );
        }
    }

    const dateFormatted = DateTime.fromISO(competition.date).setZone(tz).toFormat('dd/MM/yyyy HH:mm');
    const groupInfo = competition.altGameNote ? competition.altGameNote.replace('FIFA World Cup, ', '') : 'FIFA World Cup';
    
    const stageVi = translateStage(groupInfo);
    const statusVi = translateStatus(event.status.type.description);
    const detailVi = translateStatus(status);

    embed.addFields({
        name: '📊 Thông tin trận đấu',
        value: `📍 **Sân vận động:** ${competition.venue?.fullName || 'Chưa xác định'} (${competition.venue?.address?.city || ''})\n⏱️ **Trạng thái:** ${statusVi} (${detailVi})\n🏆 **Vòng đấu:** ${stageVi}\n📅 **Giờ bắt đầu:** ${dateFormatted} (${tz})`,
        inline: false
    });

    return embed;
}

/**
 * Formats a list of upcoming matches as a schedule.
 */
function createScheduleEmbed(events, tz = 'UTC') {
    const banner = new AttachmentBuilder('src/assets/wc_2026_banner.jpg');
    
    const embed = new EmbedBuilder()
        .setTitle('🏆 LỊCH THI ĐẤU FIFA WORLD CUP 2026')
        .setColor(0xD4AF37) // Premium Gold
        .setDescription('Danh sách lịch thi đấu các trận sắp tới, vòng bảng và địa điểm thi đấu.')
        .setImage('attachment://wc_2026_banner.jpg')
        .setTimestamp()
        .setFooter({ text: `Giờ hiển thị theo múi giờ: ${tz}` });

    events.slice(0, 10).forEach(event => {
        const comp = event.competitions[0];
        const date = DateTime.fromISO(event.date).setZone(tz).toFormat('dd/MM/yyyy HH:mm');
        const team1 = comp.competitors[0];
        const team2 = comp.competitors[1];
        
        const flag1 = getFlag(team1.team.abbreviation);
        const flag2 = getFlag(team2.team.abbreviation);
        const name1 = translateTeam(team1.team.displayName);
        const name2 = translateTeam(team2.team.displayName);
        
        const groupInfo = comp.altGameNote ? ` • ${translateStage(comp.altGameNote.replace('FIFA World Cup, ', ''))}` : '';
        const venueInfo = comp.venue?.address?.city ? `📍 ${comp.venue.address.city}` : '📍 Chưa xác định';
        
        embed.addFields({
            name: `📅 ${date} (${tz})${groupInfo}`,
            value: `➡️ ${flag1} **${name1}** vs **${name2}** ${flag2}\n${venueInfo}`,
            inline: false
        });
    });

    return { embed, banner };
}

/**
 * Formats a match from The Odds API into a beautiful embed.
 */
function createOddsEmbed(event, tz = 'UTC') {
    const flag1 = getFlagByName(event.home_team);
    const flag2 = getFlagByName(event.away_team);
    const dateFormatted = DateTime.fromISO(event.commence_time).setZone(tz).toFormat('dd/MM/yyyy HH:mm');
    
    const name1 = translateTeam(event.home_team);
    const name2 = translateTeam(event.away_team);

    const embed = new EmbedBuilder()
        .setTitle(`💰 Tỷ lệ kèo: ${name1} vs ${name2}`)
        .setColor(0xF59E0B) // Amber
        .setDescription(`### ${flag1} **${name1}** vs **${name2}** ${flag2}`)
        .setTimestamp(new Date(event.commence_time));
        
    const oddsText = getOddsText(event);
    
    embed.addFields(
        { name: '📈 Tỷ Lệ Kèo Hiện Tại', value: oddsText, inline: false },
        { name: '📅 Thời Gian Bắt Đầu', value: `\`${dateFormatted} (${tz})\``, inline: true }
    );
    
    return embed;
}

module.exports = { 
    createMatchEmbed, 
    createScheduleEmbed, 
    createOddsEmbed, 
    getFlag, 
    getFlagByName, 
    translateTeam,
    translateStatus,
    translateStage
};

