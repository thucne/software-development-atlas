import type { PathCoverage } from '@/lib/content/coverage';
import type { LearningPathDefinition } from '@/lib/content/learning-paths';
import Link from 'next/link';

export type LearningPathSummary = Pick<
  LearningPathDefinition,
  'title' | 'description' | 'audience' | 'targetDepth' | 'outcomes'
>;

const VI_PATHS: Record<
  string,
  {
    title: string;
    description: string;
    audience: string;
    outcomes: string[];
  }
> = {
  'modern-web-systems': {
    title: 'Hệ thống Web hiện đại',
    description:
      'Xây dựng mô hình tư duy cấp hệ thống về cách trình duyệt, giao thức mạng, quá trình dựng hình, kiến trúc frontend và ranh giới backend phối hợp với nhau.',
    audience:
      'Kỹ sư phần mềm muốn tư duy trên toàn bộ vòng đời yêu cầu và dựng hình web thay vì chỉ học riêng lẻ một framework.',
    outcomes: [
      'Truy vết một yêu cầu từ DNS và TLS xuyên qua trình duyệt đến ranh giới ứng dụng.',
      'So sánh các phương pháp dựng hình và tải dữ liệu frontend chính dựa trên ràng buộc và đánh đổi kỹ thuật.',
      'Nhận diện vị trí bộ nhớ đệm (caching), bảo mật trình duyệt và thiết kế backend API định hình hành vi web.',
    ],
  },
  'backend-systems': {
    title: 'Hệ thống Backend',
    description:
      'Nắm vững runtime, dữ liệu, độ tin cậy và các khái niệm hệ phân tán định hình dịch vụ backend production.',
    audience:
      'Kỹ sư phần mềm muốn thiết kế và đánh giá hệ thống backend vượt ra khỏi cơ chế controller và ORM của một framework cụ thể.',
    outcomes: [
      'Truy vết một yêu cầu backend qua xác thực dữ liệu, logic nghiệp vụ, lưu trữ bền vững, tác vụ bất đồng bộ và xử lý sự cố.',
      'Lập luận về lựa chọn cơ sở dữ liệu và xử lý đồng thời dựa trên tính đúng đắn và khả năng vận hành.',
      'Thiết kế quy trình có khả năng thử lại (retry) và bất đồng bộ với cơ chế idempotency và ngữ nghĩa chuyển giao dữ liệu rõ ràng.',
    ],
  },
  'cloud-architecture-for-software-engineers': {
    title: 'Kiến trúc đám mây cho kỹ sư phần mềm',
    description:
      'Kết nối kiến trúc ứng dụng với mạng đám mây, tính toán (compute), danh tính, lưu trữ, phân phối, khả năng quan sát (observability) và vận hành.',
    audience:
      'Kỹ sư ứng dụng cần năng lực đánh giá kiến trúc đám mây mà không biến lộ trình thành việc học chứng chỉ của một nhà cung cấp cụ thể.',
    outcomes: [
      'Ánh xạ các dịch vụ của nhà cung cấp đám mây về các khái niệm bền vững: mạng, tính toán, lưu trữ và danh tính.',
      'Giải thích cách triển khai, co giãn, giám sát và ứng phó sự cố định hình kiến trúc production.',
      'Đánh giá một thiết kế đám mây về ranh giới tin cậy, đặc quyền tối thiểu, cô lập sự cố và chi phí vận hành.',
    ],
  },
  'ai-native-software-engineering': {
    title: 'Kỹ nghệ phần mềm AI-Native',
    description:
      'Thiết kế kho mã nguồn, quy trình làm việc và hệ thống kiểm chứng để con người và các coding agent có thể thay đổi phần mềm an toàn cùng nhau.',
    audience:
      'Kỹ sư phần mềm sử dụng coding agent để triển khai thực tế, mong muốn xây dựng ngữ cảnh mạnh mẽ hơn, ràng buộc chặt chẽ, quy trình đánh giá và vòng lặp kiểm chứng.',
    outcomes: [
      'Cấu trúc ngữ cảnh trong repo để agent hiểu được kiến trúc và ràng buộc mà không cần các file hướng dẫn khổng lồ.',
      'Chuyển hóa các quy tắc kỹ thuật quan trọng thành phản hồi máy có thể tự động kiểm tra thay vì chỉ nhắc nhở qua prompt.',
      'Thiết kế vòng lặp chia nhỏ tác vụ, phản biện và đánh giá giúp giữ vững phán đoán kỹ thuật của con người trong khi gia tăng đòn bẩy triển khai.',
    ],
  },
};

const DEPTH_LABELS: Record<string, { en: string; vi: string }> = {
  recognize: { en: 'recognize', vi: 'Nhận biết' },
  reason: { en: 'reason', vi: 'Hiểu bản chất' },
  operate: { en: 'operate', vi: 'Vận hành thực tế' },
};

export function LearningPathView({
  path,
  coverage,
  locale = 'en',
}: {
  path: LearningPathSummary & { id?: string };
  coverage: PathCoverage;
  locale?: string;
}) {
  const isVi = locale === 'vi';
  const viInfo = (isVi && path.id && VI_PATHS[path.id]) || (isVi && VI_PATHS[coverage.id]);

  const title = viInfo ? viInfo.title : path.title;
  const description = viInfo ? viInfo.description : path.description;
  const audience = viInfo ? viInfo.audience : path.audience;
  const outcomes = viInfo ? viInfo.outcomes : path.outcomes;
  const targetDepthLabel = DEPTH_LABELS[path.targetDepth]?.[isVi ? 'vi' : 'en'] ?? path.targetDepth;

  return (
    <section
      aria-label={
        isVi
          ? `Lộ trình học tập ${title}`
          : `${title} learning path`
      }
      className="space-y-6"
    >
      <div className="rounded-lg border p-4">
        <h2 className="mt-0 text-xl font-semibold">{title}</h2>
        <p>{description}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-medium">{isVi ? 'Đối tượng phù hợp' : 'Audience'}</dt>
            <dd className="m-0 text-fd-muted-foreground">{audience}</dd>
          </div>
          <div>
            <dt className="font-medium">
              {isVi ? 'Mức độ tiếp cận mục tiêu' : 'Target depth'}
            </dt>
            <dd className="m-0 text-fd-muted-foreground">
              {targetDepthLabel}
            </dd>
          </div>
        </dl>
        <p className="mb-1 mt-4 text-sm text-fd-muted-foreground">
          {isVi
            ? `${coverage.covered} / ${coverage.total} khái niệm hiện đã có bài học`
            : `${coverage.covered} / ${coverage.total} concepts currently covered`}
        </p>
        <progress
          aria-label={
            isVi
              ? `Độ bao phủ ${title}`
              : `${title} coverage`
          }
          className="h-2 w-full"
          value={coverage.covered}
          max={coverage.total}
        />
      </div>

      <div>
        <h3>{isVi ? 'Mục tiêu đạt được' : 'Outcomes'}</h3>
        <ul>
          {outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>{isVi ? 'Các bước trong lộ trình' : 'Path'}</h3>
        <ol className="space-y-3 pl-6">
          {coverage.steps.map((step) => {
            const stepDepthLabel = DEPTH_LABELS[step.targetDepth]?.[isVi ? 'vi' : 'en'] ?? step.targetDepth;

            return (
              <li key={step.id} className="pl-1">
                <article className="rounded-lg border p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h4 className="m-0 text-base font-semibold">{step.title}</h4>
                    <span className="text-sm text-fd-muted-foreground">
                      {isVi ? 'Mức độ mục tiêu' : 'Target depth'}: {stepDepthLabel}
                    </span>
                  </div>

                  {step.content.length > 0 ? (
                    <div className="mt-3">
                      <p className="m-0 text-sm font-medium">
                        {isVi ? 'Nội dung Atlas hiện có' : 'Available Atlas content'}
                      </p>
                      <ul className="mb-0 mt-1 pl-5">
                        {step.content.map((content) => (
                          <li key={content.url}>
                            <Link href={content.url}>{content.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mb-0 mt-3 text-sm text-fd-muted-foreground">
                      {isVi ? 'Chưa có bài học Atlas' : 'No Atlas content yet'}
                    </p>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
