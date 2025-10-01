import matplotlib.pyplot as plt
import numpy as np
import math

def draw_triangle_with_perpendicular_bisectors(angle_BAC=96.0, angle_ABC=25.0):
    # 角度设置，增大角度差异使AB和AC边长差异更大
    # angle_BAC = 96.0  # 题目给定的角度
    # angle_ABC = 25.0  # 减小这个角度使AB边更长
    angle_ACB = 180.0 - angle_BAC - angle_ABC  # 确保角度和为180°
    
    print(f"绘制三角形ABC，其中∠BAC = {angle_BAC}°")
    print(f"∠ABC = {angle_ABC}°") 
    print(f"∠ACB = {angle_ACB}°")
    print(f"角度和 = {angle_BAC + angle_ABC + angle_ACB}°")
    
    # 转换为弧度
    A_rad = math.radians(angle_BAC)
    B_rad = math.radians(angle_ABC)
    C_rad = math.radians(angle_ACB)
    
    # 设置边长，使用正弦定理
    BC = 10.0  # BC边
    AC = BC * math.sin(B_rad) / math.sin(A_rad)  # AC边
    AB = BC * math.sin(C_rad) / math.sin(A_rad)  # AB边
    
    print(f"\n边长:")
    print(f"BC = {BC:.3f}")
    print(f"AC = {AC:.3f}")
    print(f"AB = {AB:.3f}")
    
    # 顶点坐标 - 将BC边放在水平位置，A点在上方
    B = np.array([0.0, 0.0])  # B点在原点
    C = np.array([BC, 0.0])   # C点在x轴正方向
    # A点通过三角函数计算
    # 在三角形中，已知BC长度和两个角，可以计算A点位置
    # 使用余弦定理计算AB和AC边的夹角
    A_x = (AB**2 + BC**2 - AC**2) / (2 * BC)  # B到A在BC方向上的投影
    A_y = math.sqrt(AB**2 - A_x**2)  # 垂直于BC方向的高度
    A = np.array([A_x, A_y])
    
    print(f"\n顶点坐标:")
    print(f"A = ({A[0]:.3f}, {A[1]:.3f})")
    print(f"B = ({B[0]:.3f}, {B[1]:.3f})")
    print(f"C = ({C[0]:.3f}, {C[1]:.3f})")
    
    # 绘图
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # 三角形顶点
    triangle_x = [A[0], B[0], C[0], A[0]]
    triangle_y = [A[1], B[1], C[1], A[1]]
    
    # 绘制三角形
    ax.plot(triangle_x, triangle_y, 'k-', linewidth=2)
    
    # 计算AB边的垂直平分线
    # D是AB的中点
    D = (A + B) / 2
    # AB边的方向向量
    AB_vec = B - A
    # AB边的垂直向量（旋转90度）
    AB_perp = np.array([-AB_vec[1], AB_vec[0]])
    # 垂直平分线通过D点，方向为AB_perp
    # 计算与BC边的交点E
    # BC边的方向向量
    BC_vec = C - B
    # 垂直平分线方程: D + t1 * AB_perp
    # BC边方程: B + t2 * BC_vec
    # 求解: D + t1 * AB_perp = B + t2 * BC_vec
    # 即: t1 * AB_perp - t2 * BC_vec = B - D
    
    # 解线性方程组
    matrix = np.array([[AB_perp[0], -BC_vec[0]], 
                       [AB_perp[1], -BC_vec[1]]])
    rhs = B - D
    
    try:
        # 使用numpy求解
        t = np.linalg.solve(matrix, rhs)
        t1, t2 = t[0], t[1]
        # 确保t2在[0,1]范围内，即交点在BC线段上
        if 0 <= t2 <= 1:
            E = B + t2 * BC_vec
        else:
            # 如果交点不在线段上，使用延长线上的点
            E = D + t1 * AB_perp
    except np.linalg.LinAlgError:
        # 矩阵奇异，使用另一种方法计算
        # 垂直平分线与BC边的交点E
        # BC直线方程: (y - B[1]) / (C[1] - B[1]) = (x - B[0]) / (C[0] - B[0])
        # 垂直平分线方程: (y - D[1]) / AB_perp[1] = (x - D[0]) / AB_perp[0]
        # 即: y = B[1] + (x - B[0]) * (C[1] - B[1]) / (C[0] - B[0])
        #     y = D[1] + (x - D[0]) * AB_perp[1] / AB_perp[0]
        
        # 联立求解x
        # B[1] + (x - B[0]) * (C[1] - B[1]) / (C[0] - B[0]) = D[1] + (x - D[0]) * AB_perp[1] / AB_perp[0]
        # (x - B[0]) * (C[1] - B[1]) / (C[0] - B[0]) - (x - D[0]) * AB_perp[1] / AB_perp[0] = D[1] - B[1]
        
        slope_BC = (C[1] - B[1]) / (C[0] - B[0]) if C[0] != B[0] else float('inf')
        slope_perp = AB_perp[1] / AB_perp[0] if AB_perp[0] != 0 else float('inf')
        
        if slope_BC != float('inf') and slope_perp != float('inf'):
            # 两个斜率都有限
            x = (D[1] - B[1] + B[0] * slope_BC - D[0] * slope_perp) / (slope_BC - slope_perp)
            y = B[1] + (x - B[0]) * slope_BC
            E = np.array([x, y])
        elif slope_BC == float('inf'):
            # BC垂直，x = B[0]
            x = B[0]
            y = D[1] + (x - D[0]) * slope_perp
            E = np.array([x, y])
        else:
            # 垂直平分线垂直，x = D[0]
            x = D[0]
            y = B[1] + (x - B[0]) * slope_BC
            E = np.array([x, y])
    
    # 计算AC边的垂直平分线
    # M是AC的中点
    M = (A + C) / 2
    # AC边的方向向量
    AC_vec = C - A
    # AC边的垂直向量（旋转90度）
    AC_perp = np.array([-AC_vec[1], AC_vec[0]])
    # 垂直平分线通过M点，方向为AC_perp
    # 计算与BC边的交点N
    # BC边方程: B + t * BC_vec
    # 垂直平分线方程: M + s * AC_perp
    # 求解: M + s * AC_perp = B + t * BC_vec
    # 即: s * AC_perp - t * BC_vec = B - M
    
    # 解线性方程组
    matrix2 = np.array([[AC_perp[0], -BC_vec[0]], 
                        [AC_perp[1], -BC_vec[1]]])
    rhs2 = B - M
    
    try:
        t = np.linalg.solve(matrix2, rhs2)
        s, t_val = t[0], t[1]
        # 确保t在[0,1]范围内，即交点在BC线段上
        if 0 <= t_val <= 1:
            N = B + t_val * BC_vec
        else:
            # 如果交点不在线段上，使用延长线上的点
            N = M + s * AC_perp
    except np.linalg.LinAlgError:
        # 矩阵奇异，使用另一种方法计算
        # 垂直平分线与BC边的交点N
        slope_BC = (C[1] - B[1]) / (C[0] - B[0]) if C[0] != B[0] else float('inf')
        slope_perp2 = AC_perp[1] / AC_perp[0] if AC_perp[0] != 0 else float('inf')
        
        if slope_BC != float('inf') and slope_perp2 != float('inf'):
            # 两个斜率都有限
            x = (M[1] - B[1] + B[0] * slope_BC - M[0] * slope_perp2) / (slope_BC - slope_perp2)
            y = B[1] + (x - B[0]) * slope_BC
            N = np.array([x, y])
        elif slope_BC == float('inf'):
            # BC垂直，x = B[0]
            x = B[0]
            y = M[1] + (x - M[0]) * slope_perp2
            N = np.array([x, y])
        else:
            # 垂直平分线垂直，x = M[0]
            x = M[0]
            y = B[1] + (x - B[0]) * slope_BC
            N = np.array([x, y])
    
    print(f"\n垂直平分线交点:")
    print(f"D (AB边中点) = ({D[0]:.3f}, {D[1]:.3f})")
    print(f"E (AB边垂直平分线与BC边交点) = ({E[0]:.3f}, {E[1]:.3f})")
    print(f"M (AC边中点) = ({M[0]:.3f}, {M[1]:.3f})")
    print(f"N (AC边垂直平分线与BC边交点) = ({N[0]:.3f}, {N[1]:.3f})")
    
    # 绘制AB边的垂直平分线（仅在三角形内部的部分）
    # 只显示DE部分（从D到E）
    ax.plot([D[0], E[0]], [D[1], E[1]], 'k-', linewidth=1.5)
    
    # 绘制AC边的垂直平分线（仅在三角形内部的部分）
    # 只显示MN部分（从M到N）
    ax.plot([M[0], N[0]], [M[1], N[1]], 'k-', linewidth=1.5)
    
    # 在点D处绘制垂直标记（小方块表示直角）
    # 计算AB边的单位向量
    AB_unit = AB_vec / np.linalg.norm(AB_vec)
    # 计算AB边垂直向量的单位向量
    AB_perp_unit = AB_perp / np.linalg.norm(AB_perp)
    # 绘制直角标记的大小
    mark_size = 0.3
    # 绘制直角标记：从D点开始，沿AB方向和垂直方向各画一条线段
    corner1 = D - mark_size * AB_unit
    corner2 = corner1 + mark_size * AB_perp_unit
    corner3 = D + mark_size * AB_perp_unit
    ax.plot([corner1[0], corner2[0]], [corner1[1], corner2[1]], 'k-', linewidth=1.5)
    ax.plot([corner2[0], corner3[0]], [corner2[1], corner3[1]], 'k-', linewidth=1.5)
    
    # 在点M处绘制垂直标记（小方块表示直角），确保在三角形内部
    # 计算AC边的单位向量
    AC_unit = AC_vec / np.linalg.norm(AC_vec)
    # 计算AC边垂直向量的单位向量
    AC_perp_unit = AC_perp / np.linalg.norm(AC_perp)
    # 绘制直角标记的大小
    mark_size = 0.3
    # 绘制直角标记：从M点开始，沿AC方向和垂直方向各画一条线段，确保在三角形内部
    # 确定垂直方向使得标记在三角形内部
    corner1 = M - mark_size * AC_unit
    corner2 = corner1 - mark_size * AC_perp_unit  # 调整方向使标记在三角形内部
    corner3 = M - mark_size * AC_perp_unit
    ax.plot([corner1[0], corner2[0]], [corner1[1], corner2[1]], 'k-', linewidth=1.5)
    ax.plot([corner2[0], corner3[0]], [corner2[1], corner3[1]], 'k-', linewidth=1.5)
    
    # 连接AE和AN（实线）
    ax.plot([A[0], E[0]], [A[1], E[1]], 'k-', linewidth=1)
    ax.plot([A[0], N[0]], [A[1], N[1]], 'k-', linewidth=1)
    
    # 标注顶点
    ax.text(A[0], A[1] + 0.5, 'A', fontsize=24, ha='center', va='bottom', color='black', weight='bold', style='italic', fontfamily='serif')
    ax.text(B[0] - 0.5, B[1] - 0.5, 'B', fontsize=24, ha='right', va='top', color='black', weight='bold', style='italic', fontfamily='serif')
    ax.text(C[0] + 0.5, C[1] - 0.5, 'C', fontsize=24, ha='left', va='top', color='black', weight='bold', style='italic', fontfamily='serif')
    
    # 标注垂直平分线上的点
    ax.text(D[0] - 0.5, D[1], 'D', fontsize=20, ha='right', va='center', color='black', weight='bold', style='italic', fontfamily='serif')
    ax.text(E[0], E[1] + 0.5, 'E', fontsize=20, ha='center', va='bottom', color='black', weight='bold', style='italic', fontfamily='serif')
    ax.text(M[0] + 0.5, M[1], 'M', fontsize=20, ha='left', va='center', color='black', weight='bold', style='italic', fontfamily='serif')
    ax.text(N[0], N[1] + 0.5, 'N', fontsize=20, ha='center', va='bottom', color='black', weight='bold', style='italic', fontfamily='serif')
    
    # 已删除：角A和∠EAN的圆弧标记
    
    
    # 设置图形
    ax.set_xlim(-3, 12)
    ax.set_ylim(-3, 10)
    ax.set_aspect('equal')
    
    # 移除坐标轴
    ax.axis('off')
    
    plt.tight_layout()
    plt.show()
    
    # 根据几何原理计算∠EAN的角度
    print("\n解题过程:")
    print(f"因为DE是AB边的垂直平分线，所以AE = BE，根据等腰三角形的性质，∠B = ∠BAE。")
    print(f"同理，MN是AC边的垂直平分线，所以AN = CN，∠C = ∠CAN。")
    print(f"在△ABC中，∠B + ∠C = 180° - ∠BAC = 180° - {angle_BAC}° = {180 - angle_BAC}°。")
    print(f"所以∠BAE + ∠CAN = ∠B + ∠C = {180 - angle_BAC}°。")
    print(f"则∠EAN = ∠BAC - (∠BAE + ∠CAN) = {angle_BAC}° - {180 - angle_BAC}° = {angle_BAC - (180 - angle_BAC)}°。")
    print(f"因此∠EAN的度数为 {angle_BAC - (180 - angle_BAC)}°。")

if __name__ == "__main__":
    # draw_triangle_with_perpendicular_bisectors(96.0, 55.0)
    draw_triangle_with_perpendicular_bisectors(80.0, 55.0)
