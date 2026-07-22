import type { Chapter, ChapterSummary, LocalizedText } from './types';
import { NOVELS } from './novels';

/**
 * Sinh chương & nội dung một cách general từ metadata truyện.
 * Không hardcode dữ liệu chương trong component — tất cả bắt nguồn từ đây.
 */

/** Tiêu đề chương mẫu (nối với số chương). */
const CHAPTER_TITLES: LocalizedText[] = [
  { vi: 'Khởi đầu', en: 'The Beginning' },
  { vi: 'Cơn bão đầu tiên', en: 'The First Storm' },
  { vi: 'Lời hứa dưới trăng', en: 'A Promise Under the Moon' },
  { vi: 'Bí mật bị chôn giấu', en: 'The Buried Secret' },
  { vi: 'Ngã rẽ định mệnh', en: 'A Fateful Turn' },
  { vi: 'Kẻ thù cũ', en: 'An Old Enemy' },
  { vi: 'Ánh sáng cuối đường', en: 'Light at the End' },
  { vi: 'Cuộc gặp gỡ', en: 'The Encounter' },
  { vi: 'Vực thẳm', en: 'The Abyss' },
  { vi: 'Trở về', en: 'The Return' },
  { vi: 'Đêm dài nhất', en: 'The Longest Night' },
  { vi: 'Tia hy vọng', en: 'A Glimmer of Hope' },
  { vi: 'Dấu chân trong tuyết', en: 'Footprints in the Snow' },
  { vi: 'Ván cờ tàn', en: 'The Endgame' },
  { vi: 'Kẻ phản bội', en: 'The Traitor' },
  { vi: 'Máu và danh dự', en: 'Blood and Honor' },
  { vi: 'Chiếc mặt nạ rơi xuống', en: 'The Mask Falls' },
  { vi: 'Cội nguồn sức mạnh', en: 'The Source of Power' },
  { vi: 'Bức thư chưa gửi', en: 'The Unsent Letter' },
  { vi: 'Ranh giới cuối cùng', en: 'The Final Boundary' },
  { vi: 'Kẻ lữ hành cô độc', en: 'The Lone Wanderer' },
  { vi: 'Giá của lời nguyền', en: 'The Price of the Curse' },
  { vi: 'Bình minh trở lại', en: 'Dawn Returns' },
  { vi: 'Chương cuối', en: 'The Final Chapter' },
];

/** Kho đoạn văn để dệt nội dung chương (song ngữ). */
const PARAGRAPH_POOL: LocalizedText[] = [
  {
    vi: 'Gió lạnh thổi qua khe cửa, mang theo mùi của đất ẩm và những điều chưa nói. Hắn đứng lặng bên bậu cửa, ánh mắt dõi về phía chân trời nơi ngày mới đang chậm rãi hé mở.',
    en: 'A cold wind slipped through the doorway, carrying the scent of damp earth and unspoken things. He stood still by the threshold, his gaze fixed on the horizon where a new day was slowly breaking.',
  },
  {
    vi: 'Không ai biết chuyện gì đã thực sự xảy ra vào cái đêm định mệnh ấy. Chỉ có tiếng gió và những vì sao là chứng nhân cho lời thề mà họ đã trao nhau.',
    en: 'No one truly knew what happened on that fateful night. Only the wind and the stars bore witness to the vow they had made to one another.',
  },
  {
    vi: '“Ngươi có chắc về quyết định này không?” — giọng nói vang lên từ trong bóng tối, trầm và sắc như một lưỡi dao. Nàng siết chặt bàn tay, biết rằng không còn đường lui.',
    en: '"Are you certain of this choice?" a voice rose from the darkness, low and sharp as a blade. She clenched her fist, knowing there was no turning back.',
  },
  {
    vi: 'Con đường phía trước dài và mờ mịt, nhưng trong lòng hắn đã cháy lên một ngọn lửa không gì dập tắt được. Từng bước chân, hắn tiến về phía định mệnh của mình.',
    en: 'The road ahead was long and uncertain, yet within him burned a fire that nothing could extinguish. Step by step, he advanced toward his destiny.',
  },
  {
    vi: 'Thành phố về đêm rực rỡ ánh đèn, nhưng đằng sau vẻ hào nhoáng ấy là những góc khuất mà chẳng mấy ai dám nhìn thẳng. Đó là nơi câu chuyện của chúng ta bắt đầu.',
    en: 'The city glittered at night, but behind its dazzling facade lay shadows few dared to face directly. That was where our story began.',
  },
  {
    vi: 'Ký ức tràn về như một cơn thủy triều, cuốn theo cả những niềm vui lẫn nỗi đau. Nàng nhắm mắt lại, để mặc cho quá khứ ôm trọn lấy mình một lần cuối.',
    en: 'Memories surged back like a rising tide, sweeping up both joy and pain. She closed her eyes and let the past embrace her one final time.',
  },
  {
    vi: 'Tiếng bước chân vọng lại trong hành lang vắng. Mỗi âm thanh như một hồi chuông báo hiệu điều gì đó sắp thay đổi mãi mãi.',
    en: 'Footsteps echoed through the empty corridor. Each sound was like a bell tolling that something was about to change forever.',
  },
  {
    vi: 'Họ ngồi bên nhau trong im lặng, chẳng cần lời nào. Đôi khi, sự hiện diện của một người là câu trả lời cho tất cả những câu hỏi chưa được thốt ra.',
    en: 'They sat together in silence, needing no words. Sometimes, one person’s presence is the answer to every question left unasked.',
  },
  {
    vi: 'Bầu trời chuyển sang màu tím thẫm khi những đám mây đầu tiên của cơn bão kéo đến. Có điều gì đó trong không khí báo hiệu rằng đêm nay sẽ chẳng hề yên bình.',
    en: 'The sky turned deep violet as the first clouds of the storm rolled in. Something in the air warned that this night would be anything but peaceful.',
  },
  {
    vi: 'Hắn mỉm cười, nhưng nụ cười ấy không chạm tới đôi mắt. Bên trong, một cơn bão đang cuộn trào mà không ai có thể nhìn thấy.',
    en: 'He smiled, but the smile never reached his eyes. Within, a storm churned that no one could see.',
  },
  {
    vi: 'Ánh nến lay lắt hắt lên vách đá những cái bóng dài ngoằng. Trong khoảnh khắc ấy, nàng chợt hiểu rằng có những sự thật thà không bao giờ được phơi bày dưới ánh mặt trời.',
    en: 'The flickering candlelight cast long shadows across the stone wall. In that moment she understood that some truths were never meant to be revealed in daylight.',
  },
  {
    vi: 'Lưỡi kiếm rời khỏi vỏ, phát ra tiếng ngân lạnh lẽo. Cả khu rừng như nín thở, chỉ còn lại nhịp tim dồn dập của kẻ biết mình sắp bước vào trận chiến sinh tử.',
    en: 'The blade left its sheath with a cold ringing note. The whole forest seemed to hold its breath, leaving only the pounding heartbeat of one who knew a deadly battle was near.',
  },
  {
    vi: 'Bà lão đặt chén trà nóng xuống, đôi tay run run vì tuổi tác. “Con à,” bà thì thầm, “có những món nợ không thể trả bằng tiền, mà phải trả bằng cả một đời người.”',
    en: 'The old woman set down the hot cup of tea, her hands trembling with age. "Child," she whispered, "some debts cannot be paid with money, but only with an entire lifetime."',
  },
  {
    vi: 'Mưa rơi suốt đêm không dứt, gõ lên mái ngói những nhịp điệu buồn tênh. Hắn ngồi bên ngọn đèn dầu, lật giở từng trang ký ức đã ố vàng theo năm tháng.',
    en: 'Rain fell all night without pause, tapping a melancholy rhythm on the tiled roof. He sat by the oil lamp, turning the pages of memories yellowed by the years.',
  },
  {
    vi: 'Giữa chốn phồn hoa đô hội, nàng vẫn cảm thấy cô đơn đến lạ. Dòng người hối hả lướt qua, chẳng ai dừng lại, chẳng ai hay biết trái tim nàng đang tan vỡ.',
    en: 'Amid the bustling city, she felt a strange loneliness. The hurried crowd swept past; no one stopped, no one knew her heart was breaking.',
  },
  {
    vi: 'Đứa trẻ ngước nhìn bầu trời đầy sao, đôi mắt long lanh niềm hy vọng. “Một ngày nào đó,” nó khẽ nói, “con sẽ chạm tới nơi xa xôi nhất của vũ trụ này.”',
    en: 'The child looked up at the star-filled sky, eyes shining with hope. "One day," he said softly, "I will reach the farthest corner of this universe."',
  },
  {
    vi: 'Tiếng trống trận vang rền khắp thung lũng, hòa cùng tiếng hô xung phong của muôn ngàn binh sĩ. Vận mệnh của cả một vương triều sẽ được định đoạt ngay trong ngày hôm nay.',
    en: 'War drums thundered across the valley, mingling with the battle cries of countless soldiers. The fate of an entire dynasty would be decided this very day.',
  },
  {
    vi: 'Nàng đưa tay chạm vào tấm gương cổ, và mặt kính bỗng gợn sóng như mặt nước. Phía bên kia, một thế giới hoàn toàn xa lạ đang lặng lẽ chờ nàng bước qua.',
    en: 'She reached out to touch the ancient mirror, and its surface rippled like water. On the other side, an utterly unfamiliar world waited silently for her to step through.',
  },
  {
    vi: 'Hai người bạn cũ đối diện nhau sau bao năm xa cách, giữa họ giờ đây là cả một vực sâu của những lựa chọn khác biệt. Không ai nói lời nào, nhưng ánh mắt đã nói tất cả.',
    en: 'Two old friends faced each other after years apart, a chasm of differing choices now between them. Neither spoke a word, yet their eyes said everything.',
  },
  {
    vi: 'Bí thuật cổ xưa dần hiện rõ trên nền đá, từng ký tự phát sáng rực rỡ rồi lịm tắt. Hắn biết mình vừa mở ra cánh cửa mà lẽ ra nên vĩnh viễn khép lại.',
    en: 'The ancient incantation slowly emerged upon the stone, each glyph flaring bright then fading. He knew he had just opened a door that should have stayed forever shut.',
  },
  {
    vi: 'Sương sớm giăng mờ trên cánh đồng lúa, và tiếng chim gọi bầy vang lên trong trẻo. Ở nơi bình dị này, cuối cùng nàng cũng tìm thấy chút bình yên mà bấy lâu kiếm tìm.',
    en: 'Morning mist drifted over the rice fields, and the clear calls of birds rang out. In this humble place, she finally found the peace she had long been searching for.',
  },
  {
    vi: 'Lời tiên tri năm nào cứ vang vọng mãi trong tâm trí hắn: “Khi ngôi sao đỏ mọc lên nơi chân trời, kẻ mang dòng máu cổ xưa sẽ phải lựa chọn giữa tình thân và cả thiên hạ.”',
    en: 'The old prophecy echoed endlessly in his mind: "When the red star rises on the horizon, the one of ancient blood must choose between kin and the whole world."',
  },
  {
    vi: 'Cánh cửa gỗ nặng nề khép lại sau lưng, cắt đứt mọi liên hệ với thế giới bên ngoài. Từ giây phút này, chẳng còn đường lui, cũng chẳng còn ai để nàng có thể tin tưởng.',
    en: 'The heavy wooden door closed behind her, severing all ties to the world outside. From this moment there was no retreat, and no one left she could trust.',
  },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function seededDate(novelUpdatedAt: string, index: number, total: number): string {
  const end = new Date(novelUpdatedAt).getTime();
  const dayMs = 86400000;
  // chương mới nhất gần ngày cập nhật, chương cũ lùi dần ~2 ngày/chương
  const t = end - (total - index) * 2 * dayMs;
  return new Date(t).toISOString().slice(0, 10);
}

function buildTitle(novelId: string, index: number): LocalizedText {
  const base = pick(CHAPTER_TITLES, index + novelId.length);
  return {
    vi: `Chương ${index}: ${base.vi}`,
    en: `Chapter ${index}: ${base.en}`,
  };
}

export function getChapterList(novelId: string): ChapterSummary[] {
  const novel = NOVELS.find((n) => n.id === novelId);
  if (!novel) return [];
  return Array.from({ length: novel.chapterCount }, (_, i) => {
    const index = i + 1;
    return {
      id: `${novelId}-c${index}`,
      novelId,
      index,
      title: buildTitle(novelId, index),
      publishedAt: seededDate(novel.updatedAt, index, novel.chapterCount),
      wordCount: 1600 + ((index * 137) % 1400),
    } satisfies ChapterSummary;
  });
}

export function getChapter(novelId: string, index: number): Chapter | undefined {
  const novel = NOVELS.find((n) => n.id === novelId);
  if (!novel || index < 1 || index > novel.chapterCount) return undefined;

  // Mỗi chương ~10-14 đoạn, chọn deterministic theo index để nội dung ổn định.
  const paraCount = 10 + (index % 5);
  const paragraphs: LocalizedText[] = Array.from({ length: paraCount }, (_, p) =>
    pick(PARAGRAPH_POOL, index * 7 + p * 3),
  );

  return {
    id: `${novelId}-c${index}`,
    novelId,
    index,
    title: buildTitle(novelId, index),
    publishedAt: seededDate(novel.updatedAt, index, novel.chapterCount),
    wordCount: 1600 + ((index * 137) % 1400),
    paragraphs,
  };
}
