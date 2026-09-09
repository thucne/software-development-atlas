import { defineI18n } from 'fumadocs-core/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'vi'],
  hideLocale: 'default-locale',
});

export const i18nUI = defineI18nUI(i18n, {
  en: {
    displayName: 'English',
  },
  vi: {
    displayName: 'Tiếng Việt',
    'On this page(table of contents)': 'Mục lục bài học',
    'Search(search trigger)': 'Tìm kiếm',
    'Search(search dialog)': 'Tìm kiếm bài học...',
    'Next Page(pagination)': 'Bài sau',
    'Previous Page(pagination)': 'Bài trước',
    'Choose a language(language switcher)': 'Chọn ngôn ngữ',
    'Choose a language(language switcher)(aria-label)': 'Chọn ngôn ngữ',
    'Last updated on(page footer)': 'Cập nhật lần cuối vào',
    'Edit on GitHub(edit page)': 'Chỉnh sửa trên GitHub',
    'Copy Markdown(page actions)': 'Sao chép Markdown',
    'Copied Text(code block)(aria-label)': 'Đã sao chép',
    'Copy Text(code block)(aria-label)': 'Sao chép mã',
    'Table of Contents(inline table of contents)': 'Mục lục bài học',
    'No results found(search dialog)': 'Không tìm thấy kết quả',
  },
});
